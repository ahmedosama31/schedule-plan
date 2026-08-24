import { requireAdmin } from './admin/auth';

interface Env {
    DB: D1Database;
    ADMIN_PASSWORD?: string;
}

interface CatalogUpdateBody {
    semester_id?: string;
    semester_label?: string;
    raw_text?: string;
    parsed_json?: string | unknown[];
    source_summary?: string | Record<string, unknown>;
    change_note?: string;
    activate?: boolean;
}

const jsonResponse = (payload: unknown, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json", ...headers },
    });

const getActiveSemesterId = async (env: Env) => {
    const setting = await env.DB.prepare(
        "SELECT active_semester_id FROM semester_settings WHERE id = 1"
    ).first<{ active_semester_id: string }>();
    return setting?.active_semester_id || "fall-2026-27";
};

// Returns the latest revision for a requested semester, or for the active semester.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const semesterId = url.searchParams.get("semester_id") || await getActiveSemesterId(env);
    const result = await env.DB.prepare(
        `SELECT parsed_json, semester_label, revision
         FROM course_data
         WHERE semester_id = ?
         ORDER BY revision DESC, id DESC
         LIMIT 1`
    ).bind(semesterId).first<{ parsed_json: string; semester_label: string; revision: number }>();

    if (!result) {
        return jsonResponse({ error: `No course data found for ${semesterId}` }, 404);
    }

    return new Response(result.parsed_json, {
        headers: {
            "Content-Type": "application/json",
            "X-Semester-Id": semesterId,
            "X-Semester-Label": result.semester_label,
            "X-Catalog-Revision": String(result.revision),
        },
    });
};

// Appends a catalog revision. Previous revisions and other semesters are never deleted.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const unauthorized = await requireAdmin(request, env);
    if (unauthorized) return unauthorized;

    try {
        const body = await request.json<CatalogUpdateBody>();
        const semesterId = (body.semester_id || "").trim();
        const semesterLabel = (body.semester_label || "").trim();
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(semesterId) || !semesterLabel) {
            return jsonResponse({ error: "A valid semester_id and semester_label are required" }, 400);
        }

        const courses = typeof body.parsed_json === "string"
            ? JSON.parse(body.parsed_json)
            : body.parsed_json;
        if (!Array.isArray(courses) || courses.length === 0 || courses.some(course =>
            !course || typeof course !== "object" || !("code" in course) || !("sections" in course)
        )) {
            return jsonResponse({ error: "parsed_json must be a non-empty course array" }, 400);
        }

        const latest = await env.DB.prepare(
            "SELECT COALESCE(MAX(revision), 0) AS revision FROM course_data WHERE semester_id = ?"
        ).bind(semesterId).first<{ revision: number }>();
        const revision = Number(latest?.revision || 0) + 1;
        const sourceSummary = typeof body.source_summary === "string"
            ? body.source_summary
            : body.source_summary
                ? JSON.stringify(body.source_summary)
                : null;

        const insertStatement = env.DB.prepare(
            `INSERT INTO course_data
             (semester_id, semester_label, revision, raw_text, parsed_json, source_summary, change_note, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`
        ).bind(
            semesterId,
            semesterLabel,
            revision,
            body.raw_text || "Direct JSON import",
            JSON.stringify(courses),
            sourceSummary,
            body.change_note?.trim() || null,
        );

        if (body.activate !== false) {
            const activateStatement = env.DB.prepare(
                `INSERT INTO semester_settings (id, active_semester_id, updated_at)
                 VALUES (1, ?, unixepoch())
                 ON CONFLICT(id) DO UPDATE SET
                   active_semester_id = excluded.active_semester_id,
                   updated_at = excluded.updated_at`
            ).bind(semesterId);
            const [insert] = await env.DB.batch([insertStatement, activateStatement]);
            if (!insert.success) {
                return jsonResponse({ error: "Failed to insert catalog revision" }, 500);
            }
        } else {
            const insert = await insertStatement.run();
            if (!insert.success) {
                return jsonResponse({ error: "Failed to insert catalog revision" }, 500);
            }
        }

        return jsonResponse({ success: true, semester_id: semesterId, revision, active: body.activate !== false });
    } catch (error) {
        return jsonResponse({ error: String(error) }, 500);
    }
};
