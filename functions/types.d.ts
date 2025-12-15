// Cloudflare Pages Functions type declarations
declare module '@cloudflare/workers-types' {
    export interface Env {
        DB: D1Database;
    }
}

interface Env {
    DB: D1Database;
}

type PagesFunction<Env = any> = (context: {
    request: Request;
    env: Env;
    params: Record<string, string>;
    waitUntil: (promise: Promise<any>) => void;
    next: () => Promise<Response>;
    data: Record<string, any>;
}) => Response | Promise<Response>;
