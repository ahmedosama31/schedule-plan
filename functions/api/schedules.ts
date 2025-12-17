interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    try {
        const body = await request.json() as {
            student_id: string;
            schedule_json: string;
            pin?: string;
            schedule_name?: string;
        };

        if (!body.student_id || !body.schedule_json) {
            return new Response("Missing student_id or schedule_json", { status: 400 });
        }

        const existing = await env.DB.prepare(
            "SELECT pin FROM schedules WHERE student_id = ?"
        ).bind(body.student_id).first();

        if (existing) {
            if (existing.pin) {
                // Robust comparison
                const storedPin = String(existing.pin).trim();
                const providedPin = body.pin ? String(body.pin).trim() : "";

                if (providedPin !== storedPin) {
                    return new Response(JSON.stringify({ error: "Invalid PIN" }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }

            // Update
            const { success } = await env.DB.prepare(
                `UPDATE schedules SET 
                    schedule_json = ?, 
                    pin = COALESCE(?, pin), 
                    schedule_name = COALESCE(?, schedule_name),
                    updated_at = unixepoch() 
                WHERE student_id = ?`
            )
                .bind(body.schedule_json, body.pin || null, body.schedule_name || null, body.student_id)
                .run();

            if (!success) return new Response("Failed to update", { status: 500 });
        } else {
            // New schedule - PIN is optional (for autosave support)
            // If no PIN provided, creates an unprotected schedule
            const name = body.schedule_name || "My Schedule";

            const { success } = await env.DB.prepare(
                `INSERT INTO schedules (student_id, schedule_json, pin, schedule_name, updated_at) VALUES (?, ?, ?, ?, unixepoch())`
            )
                .bind(body.student_id, body.schedule_json, body.pin || null, name)
                .run();

            if (!success) return new Response("Failed to create", { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    const pin = request.headers.get("X-Auth-Pin");

    if (!studentId) {
        return new Response("Missing student_id param", { status: 400 });
    }

    const result = await env.DB.prepare(
        "SELECT schedule_json, pin, schedule_name FROM schedules WHERE student_id = ?"
    )
        .bind(studentId)
        .first();

    if (!result) {
        return new Response(JSON.stringify({ exists: false }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const responseBase = {
        exists: true,
        protected: !!result.pin,
        schedule_name: result.schedule_name || "My Schedule"
    };

    if (result.pin) {
        // Robust comparison: handle potential type differences or whitespace
        const storedPin = String(result.pin).trim();
        const providedPin = pin ? String(pin).trim() : "";

        if (!providedPin || providedPin !== storedPin) {
            // Return base info (name) but no JSON
            return new Response(JSON.stringify({ ...responseBase, protected: true }), {
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    return new Response(JSON.stringify({
        ...responseBase,
        protected: false, // Auth successful or not protected, so we unlock
        schedule_json: result.schedule_json
    }), {
        headers: { "Content-Type": "application/json" },
    });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");

    if (!studentId) {
        return new Response("Missing student_id param", { status: 400 });
    }

    try {
        const { success } = await env.DB.prepare(
            "DELETE FROM schedules WHERE student_id = ?"
        ).bind(studentId).run();

        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};
