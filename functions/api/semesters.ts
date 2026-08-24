interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const includeRevisions = url.searchParams.get("include_revisions") === "true";
    const active = await env.DB.prepare(
        "SELECT active_semester_id FROM semester_settings WHERE id = 1"
    ).first<{ active_semester_id: string }>();

    const latest = await env.DB.prepare(
        `SELECT semester_id, semester_label, MAX(revision) AS latest_revision, MAX(updated_at) AS updated_at
         FROM course_data
         GROUP BY semester_id, semester_label
         ORDER BY updated_at DESC`
    ).all();

    let revisions: unknown[] | undefined;
    if (includeRevisions) {
        const result = await env.DB.prepare(
            `SELECT id, semester_id, semester_label, revision, source_summary, change_note, updated_at
             FROM course_data
             ORDER BY updated_at DESC, id DESC`
        ).all();
        revisions = result.results;
    }

    return new Response(JSON.stringify({
        active_semester_id: active?.active_semester_id || "fall-2026-27",
        semesters: latest.results,
        ...(revisions ? { revisions } : {}),
    }), { headers: { "Content-Type": "application/json" } });
};
