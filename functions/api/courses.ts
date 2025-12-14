interface Env {
    DB: D1Database;
}

// GET: Returns the latest parsed course data
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    // Get latest course data
    const result = await env.DB.prepare(
        "SELECT parsed_json FROM course_data ORDER BY id DESC LIMIT 1"
    ).first();

    if (!result) {
        // If no data in DB, return null/error or handle gracefully
        return new Response(JSON.stringify({ error: "No course data found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(result.parsed_json as string, {
        headers: { "Content-Type": "application/json" },
    });
};
// POST: Accepts raw course text and parsed JSON to update the database
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json() as {
            raw_text: string;
            parsed_json: string; // We expect client to send stringified JSON
        };

        if (!body.raw_text || !body.parsed_json) {
            return new Response("Missing raw_text or parsed_json", { status: 400 });
        }

        const { success } = await env.DB.prepare(
            "INSERT INTO course_data (raw_text, parsed_json, updated_at) VALUES (?, ?, unixepoch())"
        ).bind(body.raw_text, body.parsed_json).run();

        if (!success) {
            return new Response("Failed to insert course data", { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};
