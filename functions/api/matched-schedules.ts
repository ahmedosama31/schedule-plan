type MatchedScheduleInput = {
    student_id: string;
    source_schedule_name?: string | null;
    target_schedule_name: string;
    schedule_json: string;
};

type MatchedSchedulesBody = {
    schedules?: MatchedScheduleInput[];
};

const jsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
});

function validateSchedule(input: MatchedScheduleInput, index: number): string | null {
    if (!input || typeof input !== 'object') return `Schedule ${index + 1} is invalid`;
    if (!input.student_id?.trim()) return `Schedule ${index + 1} is missing student_id`;
    if (!input.target_schedule_name?.trim()) return `Schedule ${index + 1} is missing target_schedule_name`;
    if (input.source_schedule_name?.trim() === input.target_schedule_name.trim()) {
        return `Schedule ${index + 1} must be saved as a new matched copy`;
    }
    if (typeof input.schedule_json !== 'string') return `Schedule ${index + 1} is missing schedule_json`;
    try {
        const parsed = JSON.parse(input.schedule_json);
        if (!Array.isArray(parsed)) return `Schedule ${index + 1} must contain a schedule array`;
    } catch {
        return `Schedule ${index + 1} contains invalid schedule_json`;
    }
    return null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let schedules: MatchedScheduleInput[] = [];
    try {
        const body = await request.json() as MatchedSchedulesBody;
        schedules = body.schedules || [];
    } catch {
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    if (schedules.length !== 2) {
        return jsonResponse({ success: false, error: 'Exactly two schedules are required' }, 400);
    }

    const validationError = schedules.map(validateSchedule).find(Boolean);
    if (validationError) return jsonResponse({ success: false, error: validationError }, 400);

    const normalized = schedules.map(schedule => ({
        ...schedule,
        student_id: schedule.student_id.trim(),
        source_schedule_name: schedule.source_schedule_name?.trim() || null,
        target_schedule_name: schedule.target_schedule_name.trim(),
    }));

    if (normalized[0].student_id === normalized[1].student_id) {
        return jsonResponse({ success: false, error: 'Student IDs must be different' }, 400);
    }

    const saveSql = `INSERT INTO schedules (student_id, schedule_json, pin, schedule_name, updated_at)
        VALUES (?, ?, NULL, ?, unixepoch())
        ON CONFLICT(student_id, schedule_name) DO UPDATE SET
            schedule_json = excluded.schedule_json,
            pin = NULL,
            updated_at = unixepoch()`;
    const activitySql = `INSERT INTO schedule_activity_logs
        (student_id, schedule_name, action, status, course_count, error_message, created_at)
        VALUES (?, ?, 'manual_save', 'success', ?, NULL, unixepoch())`;

    try {
        const results = await env.DB.batch([
            ...normalized.map(schedule => env.DB.prepare(saveSql).bind(
                schedule.student_id,
                schedule.schedule_json,
                schedule.target_schedule_name,
            )),
            ...normalized.map(schedule => env.DB.prepare(activitySql).bind(
                schedule.student_id,
                schedule.target_schedule_name,
                (JSON.parse(schedule.schedule_json) as unknown[]).length,
            )),
            ...normalized.map(schedule => env.DB.prepare(
                'SELECT updated_at FROM schedules WHERE student_id = ? AND schedule_name = ?',
            ).bind(schedule.student_id, schedule.target_schedule_name)),
        ]);

        const saved = normalized.map((schedule, index) => {
            const row = results[4 + index].results?.[0] as { updated_at?: number } | undefined;
            return {
                student_id: schedule.student_id,
                schedule_name: schedule.target_schedule_name,
                updated_at: row?.updated_at || null,
            };
        });
        return jsonResponse({ success: true, schedules: saved });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        try {
            await env.DB.batch(normalized.map(schedule => env.DB.prepare(
                `INSERT INTO schedule_activity_logs
                 (student_id, schedule_name, action, status, course_count, error_message, created_at)
                 VALUES (?, ?, 'manual_save', 'failed', ?, ?, unixepoch())`,
            ).bind(
                schedule.student_id,
                schedule.target_schedule_name,
                (JSON.parse(schedule.schedule_json) as unknown[]).length,
                message,
            )));
        } catch (logError) {
            console.warn('Failed to record matched schedule save failure', logError);
        }
        return jsonResponse({ success: false, error: 'Failed to save both schedules' }, 500);
    }
};
