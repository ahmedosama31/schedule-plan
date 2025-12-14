interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        // Fetch all schedules
        const { results } = await env.DB.prepare(
            "SELECT schedule_json FROM schedules"
        ).all();

        if (!results || results.length === 0) {
            return new Response(JSON.stringify({ totalSchedules: 0, courseStats: [], sectionStats: {} }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const courseCounts: Record<string, number> = {};
        // Store counts as: "CS101-Lecture-A": 5
        const sectionCounts: Record<string, number> = {};

        results.forEach((row: any) => {
            try {
                const schedule = JSON.parse(row.schedule_json);
                if (Array.isArray(schedule)) {
                    schedule.forEach((item: any) => {
                        if (item && item.courseCode) {
                            courseCounts[item.courseCode] = (courseCounts[item.courseCode] || 0) + 1;

                            // Count detailed sections if available
                            // item structure: { courseCode, selectedLectureId, selectedTutorialId, selectedLabId, selectedMthsGroup ... }

                            if (item.selectedLectureId) {
                                const key = `${item.courseCode} Lecture ${item.selectedLectureId}`;
                                sectionCounts[key] = (sectionCounts[key] || 0) + 1;
                            }
                            if (item.selectedTutorialId) {
                                const key = `${item.courseCode} Tutorial ${item.selectedTutorialId}`;
                                sectionCounts[key] = (sectionCounts[key] || 0) + 1;
                            }
                            if (item.selectedLabId) {
                                const key = `${item.courseCode} Lab ${item.selectedLabId}`;
                                sectionCounts[key] = (sectionCounts[key] || 0) + 1;
                            }
                            if (item.selectedMthsGroup) {
                                const key = `${item.courseCode} Group ${item.selectedMthsGroup}`;
                                sectionCounts[key] = (sectionCounts[key] || 0) + 1;
                            }
                        }
                    });
                }
            } catch (e) {
                // Ignore parsing errors for individual rows
            }
        });

        // Convert to array and sort
        const courseStats = Object.entries(courseCounts)
            .map(([code, count]) => ({ code, count }))
            .sort((a, b) => b.count - a.count);

        // Convert section stats to array and sort
        const sectionStatsArray = Object.entries(sectionCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return new Response(JSON.stringify({
            totalSchedules: results.length,
            courseStats,
            sectionStats: sectionStatsArray
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(`Error: ${e}`, { status: 500 });
    }
};
