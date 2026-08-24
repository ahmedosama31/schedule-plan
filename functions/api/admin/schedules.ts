import { requireAdmin } from './auth';

interface Env {
    DB: D1Database;
    ADMIN_PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    // Verify admin authentication
    const unauthorized = await requireAdmin(context.request, context.env);
    if (unauthorized) return unauthorized;

    try {
        const { results } = await context.env.DB.prepare(
            "SELECT student_id, schedule_name, schedule_json, created_at, updated_at FROM schedules ORDER BY updated_at DESC LIMIT 1000"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
};
