import { requireAdmin } from './auth';

interface Env {
    DB: D1Database;
    ADMIN_PASSWORD?: string;
}

const clampLimit = (value: string | null) => {
    const parsed = Number(value || 200);
    if (!Number.isFinite(parsed)) return 200;
    return Math.min(Math.max(Math.floor(parsed), 1), 1000);
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const unauthorized = await requireAdmin(context.request, context.env);
    if (unauthorized) return unauthorized;

    const url = new URL(context.request.url);
    const filters: string[] = [];
    const bindings: (string | number)[] = [];

    const studentId = url.searchParams.get("student_id")?.trim();
    const scheduleName = url.searchParams.get("schedule_name")?.trim();
    const action = url.searchParams.get("action")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const limit = clampLimit(url.searchParams.get("limit"));

    if (studentId) {
        filters.push("student_id LIKE ?");
        bindings.push(`%${studentId}%`);
    }
    if (scheduleName) {
        filters.push("schedule_name LIKE ?");
        bindings.push(`%${scheduleName}%`);
    }
    if (action) {
        filters.push("action = ?");
        bindings.push(action);
    }
    if (status) {
        filters.push("status = ?");
        bindings.push(status);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    try {
        const { results } = await context.env.DB.prepare(
            `SELECT id, student_id, schedule_name, action, status, course_count, error_message, created_at
             FROM schedule_activity_logs
             ${where}
             ORDER BY created_at DESC
             LIMIT ?`
        ).bind(...bindings, limit).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
