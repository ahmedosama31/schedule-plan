interface Env {
    DB: D1Database;
}

const DEFAULT_SCHEDULE_NAME = "fall26-27";
type ScheduleAction = "autosave" | "manual_save" | "delete";

const jsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
});

const normalizeScheduleName = (name?: string) => {
    const trimmed = (name || DEFAULT_SCHEDULE_NAME).trim();
    return trimmed || DEFAULT_SCHEDULE_NAME;
};

const normalizeAction = (source?: string): ScheduleAction => {
    if (source === "autosave" || source === "manual_save") return source;
    return "manual_save";
};

const getCourseCount = (scheduleJson?: string) => {
    if (!scheduleJson) return 0;
    try {
        const parsed = JSON.parse(scheduleJson);
        return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
        return 0;
    }
};

const writeActivityLog = async (
    env: Env,
    studentId: string,
    scheduleName: string,
    action: ScheduleAction,
    status: "success" | "failed",
    courseCount = 0,
    errorMessage?: string
) => {
    try {
        await env.DB.prepare(
            `INSERT INTO schedule_activity_logs 
             (student_id, schedule_name, action, status, course_count, error_message, created_at)
             VALUES (?, ?, ?, ?, ?, ?, unixepoch())`
        ).bind(studentId, scheduleName, action, status, courseCount, errorMessage || null).run();
    } catch (e) {
        console.warn("Failed to write schedule activity log", e);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    let body: {
        student_id?: string;
        schedule_json?: string;
        pin?: string;
        schedule_name?: string;
        source?: string;
    } = {};

    try {
        body = await request.json();
        const studentId = (body.student_id || "").trim();
        const scheduleJson = body.schedule_json;
        const scheduleName = normalizeScheduleName(body.schedule_name);
        const action = normalizeAction(body.source);
        const courseCount = getCourseCount(scheduleJson);

        if (!studentId) {
            await writeActivityLog(env, "unknown", scheduleName, action, "failed", courseCount, "Missing student_id");
            return jsonResponse({ success: false, error: "Missing student_id" }, 400);
        }

        if (typeof scheduleJson !== "string") {
            await writeActivityLog(env, studentId, scheduleName, action, "failed", 0, "Missing schedule_json");
            return jsonResponse({ success: false, error: "Missing schedule_json" }, 400);
        }

        try {
            JSON.parse(scheduleJson);
        } catch {
            await writeActivityLog(env, studentId, scheduleName, action, "failed", 0, "Invalid schedule_json");
            return jsonResponse({ success: false, error: "Invalid schedule_json" }, 400);
        }

        // Efficiently Upsert (Insert or Update) using ON CONFLICT provided by SQLite/D1
        // We set pin to NULL as the feature is currently disabled
        const { success } = await env.DB.prepare(
            `INSERT INTO schedules (student_id, schedule_json, pin, schedule_name, updated_at) 
             VALUES (?, ?, NULL, ?, unixepoch())
             ON CONFLICT(student_id, schedule_name) DO UPDATE SET 
                schedule_json = excluded.schedule_json,
                pin = NULL, 
                updated_at = unixepoch()`
        )
            .bind(studentId, scheduleJson, scheduleName)
            .run();

        if (!success) {
            await writeActivityLog(env, studentId, scheduleName, action, "failed", courseCount, "Failed to save schedule");
            return jsonResponse({ success: false, error: "Failed to save schedule" }, 500);
        }

        const updated = await env.DB.prepare(
            "SELECT updated_at FROM schedules WHERE student_id = ? AND schedule_name = ?"
        ).bind(studentId, scheduleName).first<{ updated_at: number }>();

        await writeActivityLog(env, studentId, scheduleName, action, "success", courseCount);

        return jsonResponse({ success: true, schedule_name: scheduleName, updated_at: updated?.updated_at || null });
    } catch (e) {
        const studentId = body.student_id?.trim() || "unknown";
        const scheduleName = normalizeScheduleName(body.schedule_name);
        const action = normalizeAction(body.source);
        await writeActivityLog(env, studentId, scheduleName, action, "failed", getCourseCount(body.schedule_json), String(e));
        return jsonResponse({ success: false, error: String(e) }, 500);
    }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    const scheduleName = normalizeScheduleName(url.searchParams.get("schedule_name") || undefined);
    const listAll = url.searchParams.get("list_all") === "true";

    if (!studentId) {
        return jsonResponse({ success: false, error: "Missing student_id param" }, 400);
    }

    // If list_all, return all schedule names for this user
    if (listAll) {
        const results = await env.DB.prepare(
            "SELECT schedule_name, created_at, updated_at, pin IS NOT NULL as protected FROM schedules WHERE student_id = ? ORDER BY updated_at DESC"
        ).bind(studentId).all();

        return jsonResponse({
            schedules: results.results.map(r => ({
                name: r.schedule_name,
                protected: !!r.protected,
                created_at: r.created_at,
                updated_at: r.updated_at
            }))
        });
    }

    const result = await env.DB.prepare(
        "SELECT schedule_json, pin, schedule_name FROM schedules WHERE student_id = ? AND schedule_name = ?"
    )
        .bind(studentId, scheduleName)
        .first();

    if (!result) {
        return jsonResponse({ exists: false });
    }

    const responseBase = {
        exists: true,
        protected: !!result.pin,
        schedule_name: result.schedule_name || DEFAULT_SCHEDULE_NAME
    };

    // PIN check DISABLED - always return schedule data regardless of PIN
    // Original PIN check code preserved for future re-activation:
    // if (result.pin) {
    //     const storedPin = String(result.pin).trim();
    //     const providedPin = pin ? String(pin).trim() : "";
    //     if (!providedPin || providedPin !== storedPin) {
    //         return new Response(JSON.stringify({ ...responseBase, protected: true }), {
    //             headers: { "Content-Type": "application/json" },
    //         });
    //     }
    // }

    return jsonResponse({
        ...responseBase,
        protected: false, // Auth successful or not protected, so we unlock
        schedule_json: result.schedule_json
    });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const studentId = (url.searchParams.get("student_id") || "").trim();
    const scheduleName = normalizeScheduleName(url.searchParams.get("schedule_name") || undefined);

    if (!studentId) {
        await writeActivityLog(env, "unknown", scheduleName, "delete", "failed", 0, "Missing student_id param");
        return jsonResponse({ success: false, error: "Missing student_id param" }, 400);
    }

    try {
        const { success } = await env.DB.prepare(
            "DELETE FROM schedules WHERE student_id = ? AND schedule_name = ?"
        ).bind(studentId, scheduleName).run();

        await writeActivityLog(env, studentId, scheduleName, "delete", success ? "success" : "failed", 0, success ? undefined : "Failed to delete schedule");
        return jsonResponse({ success, schedule_name: scheduleName });
    } catch (e) {
        await writeActivityLog(env, studentId, scheduleName, "delete", "failed", 0, String(e));
        return jsonResponse({ success: false, error: String(e) }, 500);
    }
};
