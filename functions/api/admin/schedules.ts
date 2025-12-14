export const onRequestGet: PagesFunction<Env> = async (context) => {
    // In a real app, verify Admin Auth header here.

    try {
        const { results } = await context.env.DB.prepare(
            "SELECT student_id, schedule_name, schedule_json, created_at, updated_at FROM schedules ORDER BY updated_at DESC"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
