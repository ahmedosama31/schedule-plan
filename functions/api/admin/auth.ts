export interface AdminEnv {
    ADMIN_PASSWORD?: string;
}

const jsonResponse = (payload: unknown, status: number) => new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
});

const secureEquals = async (left: string, right: string) => {
    const encoder = new TextEncoder();
    const [leftHash, rightHash] = await Promise.all([
        crypto.subtle.digest("SHA-256", encoder.encode(left)),
        crypto.subtle.digest("SHA-256", encoder.encode(right)),
    ]);
    const leftBytes = new Uint8Array(leftHash);
    const rightBytes = new Uint8Array(rightHash);
    let difference = left.length ^ right.length;
    for (let index = 0; index < leftBytes.length; index += 1) {
        difference |= leftBytes[index] ^ rightBytes[index];
    }
    return difference === 0;
};

export const requireAdmin = async (request: Request, env: AdminEnv): Promise<Response | null> => {
    if (!env.ADMIN_PASSWORD) {
        return jsonResponse({ error: "ADMIN_PASSWORD is not configured" }, 503);
    }
    const providedAuthorization = request.headers.get("Authorization") || "";
    return await secureEquals(providedAuthorization, `Bearer ${env.ADMIN_PASSWORD}`)
        ? null
        : jsonResponse({ error: "Unauthorized" }, 401);
};

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) =>
    await requireAdmin(request, env) || new Response(null, { status: 204 });
