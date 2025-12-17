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

        const scheduleName = body.schedule_name || "spring26";

        // Check for existing schedule with this name
        const existing = await env.DB.prepare(
            "SELECT pin FROM schedules WHERE student_id = ? AND schedule_name = ?"
        ).bind(body.student_id, scheduleName).first();

        if (existing) {
            // PIN check DISABLED - allowing all saves without PIN verification
            // Original PIN check code preserved for future re-activation:
            // if (existing.pin) {
            //     const storedPin = String(existing.pin).trim();
            //     const providedPin = body.pin ? String(body.pin).trim() : "";
            //     if (providedPin !== storedPin) {
            //         return new Response(JSON.stringify({ error: "Invalid PIN" }), {
            //             status: 401, headers: { "Content-Type": "application/json" }
            //         });
            //     }
            // }

            // Update existing schedule (clear PIN since feature is disabled)
            const { success } = await env.DB.prepare(
                `UPDATE schedules SET 
                    schedule_json = ?, 
                    pin = NULL,
                    updated_at = unixepoch() 
                WHERE student_id = ? AND schedule_name = ?`
            )
                .bind(body.schedule_json, body.student_id, scheduleName)
                .run();

            if (!success) return new Response("Failed to update", { status: 500 });
        } else {
            // New schedule - no PIN (feature disabled)
            const { success } = await env.DB.prepare(
                `INSERT INTO schedules (student_id, schedule_json, pin, schedule_name, updated_at) VALUES (?, ?, NULL, ?, unixepoch())`
            )
                .bind(body.student_id, body.schedule_json, scheduleName)
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
    const scheduleName = url.searchParams.get("schedule_name") || "spring26";
    const listAll = url.searchParams.get("list_all") === "true";
    const pin = request.headers.get("X-Auth-Pin");

    if (!studentId) {
        return new Response("Missing student_id param", { status: 400 });
    }

    // If list_all, return all schedule names for this user
    if (listAll) {
        const results = await env.DB.prepare(
            "SELECT schedule_name, created_at, updated_at, pin IS NOT NULL as protected FROM schedules WHERE student_id = ? ORDER BY updated_at DESC"
        ).bind(studentId).all();

        return new Response(JSON.stringify({
            schedules: results.results.map(r => ({
                name: r.schedule_name,
                protected: !!r.protected,
                created_at: r.created_at,
                updated_at: r.updated_at
            }))
        }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const result = await env.DB.prepare(
        "SELECT schedule_json, pin, schedule_name FROM schedules WHERE student_id = ? AND schedule_name = ?"
    )
        .bind(studentId, scheduleName)
        .first();

    if (!result) {
        return new Response(JSON.stringify({ exists: false }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    const responseBase = {
        exists: true,
        protected: !!result.pin,
        schedule_name: result.schedule_name || "spring26"
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
    const scheduleName = url.searchParams.get("schedule_name") || "spring26";

    if (!studentId) {
        return new Response("Missing student_id param", { status: 400 });
    }

    try {
        const { success } = await env.DB.prepare(
            "DELETE FROM schedules WHERE student_id = ? AND schedule_name = ?"
        ).bind(studentId, scheduleName).run();

        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};
