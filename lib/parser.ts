import { Course, Section, SectionType, ClassSession, DayOfWeek } from '../types';

export const parseRawCourseData = (rawText: string): Course[] => {
    const lines = rawText.split('\n');
    const coursesMap = new Map<string, Course>();

    lines.forEach(line => {
        const parts = line.split('\t').map(p => p.trim());
        if (parts.length < 10) return; // Skip invalid lines

        // Expected format:
        // 0: id, 1: Code (__GENS209__), 2: Name, 3: Group (1), 4: Type (Lecture_), 
        // 5: Day (Sunday), 6: From (9:00_), 7: To (10:50___), ..., 12: Location

        const rawCode = parts[1].replace(/_/g, '');
        const rawName = parts[2];
        const rawGroup = parts[3];
        const rawType = parts[4].replace(/_/g, '');
        const rawDay = parts[5];
        const rawFrom = parts[6].replace(/_/g, '');
        const rawTo = parts[7].replace(/_/g, '');
        // const rawLoc = parts[12]; // e.g. [20103]20103-60-الجيزة الرئيسي

        if (!rawCode || !rawDay || !rawFrom || !rawTo) return;

        // Normalize Type
        let type: SectionType = SectionType.Lecture;
        if (rawType.toLowerCase().includes('tutorial') || rawType.toLowerCase().includes('section')) type = SectionType.Tutorial;
        if (rawType.toLowerCase().includes('lab')) type = SectionType.Lab;

        // Normalize Day
        // Assuming simple string match "Sunday", "Monday" etc. 
        // Our system might expect "Sunday" etc. matching data.ts

        // Normalize Time (12h to 24h conversion based on Uni hours 8am-7pm)
        // Rule: 1-7 -> PM (+12), 12 -> PM (Noon), 8-11 -> AM
        const to24Hour = (hour: number): number => {
            if (hour >= 1 && hour <= 7) return hour + 12;
            return hour; // 8, 9, 10, 11, 12 remain as is
        };

        let startH = parseInt(rawFrom.split(':')[0]);
        let endH = parseInt(rawTo.split(':')[0]);

        const startHour = to24Hour(startH);
        let endHour = to24Hour(endH);

        if (rawTo.includes(':50') || rawTo.includes(':30')) endHour += 1;

        // Ensure endHour is essentially the ceiling for block reservation
        // But wait, if 12:00 -> 1:50. Start=12, End=1 (becomes 13) + 1 = 14. Correct (12-14 block).
        // If 1:00 -> 2:50. Start=1 (13). End=2 (14) + 1 = 15. Correct (13-15 block).


        if (!coursesMap.has(rawCode)) {
            coursesMap.set(rawCode, {
                code: rawCode,
                name: rawName,
                sections: [],
                isMTHS: rawCode.startsWith('MTHS')
            });
        }

        const course = coursesMap.get(rawCode)!;

        // Create a distinct Section per row.
        // Some inputs reuse the same group number for different lecture times,
        // and we do NOT want those to be merged into a multi-session section.
        const sectionId = `${rawCode}-${type}-${rawGroup}-${rawDay}-${rawFrom}-${rawTo}`;
        const section: Section = {
            id: sectionId,
            courseCode: rawCode,
            type,
            group: rawGroup,
            sessions: []
        };
        course.sections.push(section);

        // Create clean time strings
        const cleanStart = rawFrom.includes(':') ? rawFrom : `${rawFrom}:00`;
        const cleanEnd = rawTo.includes(':') ? rawTo : `${rawTo}:00`;

        // Cast Day safely
        const dayEnum = Object.values(DayOfWeek).find(d => d === rawDay) || DayOfWeek.Sunday; // Default fallback

        section.sessions.push({
            day: dayEnum as DayOfWeek,
            startHour: startHour,
            endHour: endHour,
            startString: cleanStart,
            endString: cleanEnd
        });
    });

    return Array.from(coursesMap.values());
};
