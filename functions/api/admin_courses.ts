interface Env {
    DB: D1Database;
}

// POST: Admin updates course data (Raw Text -> Parse -> Save JSON)
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Basic Auth (Replace "12345678" with your env var or keep simple as requested)
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer 12345678") {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json() as { raw_text: string, parsed_json: string };

        // We expect the frontend to do the parsing and send us valid JSON
        // for simplicity, or we could move the parsing logic here.
        // Given the parsing is complex TS code, let's keep it on the client for now 
        // and just save what they send.

        if (!body.raw_text || !body.parsed_json) {
            return new Response("Missing data", { status: 400 });
        }

        const { success } = await env.DB.prepare(
            "INSERT INTO course_data (raw_text, parsed_json, updated_at) VALUES (?, ?, unixepoch())"
        )
            .bind(body.raw_text, JSON.stringify(body.parsed_json))
            .run();

        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};
