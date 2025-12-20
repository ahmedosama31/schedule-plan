interface Env {
    DB: D1Database;
}

// Admin password - in production, use environment variables or a secure auth system
const ADMIN_PASSWORD = "12345678";

/**
 * Validates the admin authorization header.
 * Expects: Authorization: Bearer <password>
 */
const validateAdminAuth = (request: Request): boolean => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return false;

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) return false;

    return token === ADMIN_PASSWORD;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    // Verify admin authentication
    if (!validateAdminAuth(context.request)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

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
