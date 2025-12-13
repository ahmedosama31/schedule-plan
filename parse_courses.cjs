const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, 'raw_courses.txt');
const OUT_FILE = path.join(__dirname, 'data.ts');

// Day mapping
const DAY_MAP = {
    'Sunday': 'DayOfWeek.Sunday',
    'Monday': 'DayOfWeek.Monday',
    'Tuesday': 'DayOfWeek.Tuesday',
    'Wednesday': 'DayOfWeek.Wednesday',
    'Thursday': 'DayOfWeek.Thursday',
    'Friday': 'DayOfWeek.Friday',
    'Saturday': 'DayOfWeek.Saturday'
};

const SECTION_TYPE_MAP = {
    'Lecture': 'SectionType.Lecture',
    'Tutorial': 'SectionType.Tutorial',
    'Lab': 'SectionType.Lab' // Assuming 'Lab' maps to 'Laboratory' in types, but let's check input
};

function parseTime(timeStr) {
    // Format: "9:00_" -> {h:9, m:0}
    const clean = timeStr.replace(/_/g, '').trim();
    const parts = clean.split(':');
    return {
        h: parseInt(parts[0], 10),
        m: parseInt(parts[1], 10)
    };
}

function cleanString(str) {
    return str.replace(/_/g, '').trim();
}

function generateData() {
    console.log('Reading raw file...');
    const rawContent = fs.readFileSync(RAW_FILE, 'utf8');
    const lines = rawContent.split('\n').filter(l => l.trim().length > 0);

    const coursesMap = new Map(); // Code -> Course Object

    console.log(`Found ${lines.length} lines. Processing...`);

    lines.forEach((line, idx) => {
        // Tab separated
        // 0: ID, 1: Code, 2: Name, 3: Group, 4: Type, 5: Day, 6: From, 7: To, ..., 12: Location
        const parts = line.split('\t').map(p => p.trim());

        if (parts.length < 13) {
            // console.warn(`Line ${idx+1} invalid: ${line.substring(0, 50)}...`);
            return;
        }

        const codeRaw = cleanString(parts[1]); // __GENS209__ -> GENS209
        const code = codeRaw.replace(/[^a-zA-Z0-9]/g, ''); // Ensure clean code
        const name = parts[2];
        const group = parts[3];
        const typeRaw = cleanString(parts[4]); // Lecture_
        const dayRaw = parts[5];
        const startRaw = parts[6];
        const endRaw = parts[7];
        const location = parts[12];

        // Parse Type
        let typeEnum = 'SectionType.Lecture';
        if (typeRaw.toLowerCase().includes('tutorial')) typeEnum = 'SectionType.Tutorial';
        else if (typeRaw.toLowerCase().includes('lab')) typeEnum = 'SectionType.Lab';

        // Parse Day
        const dayEnum = DAY_MAP[dayRaw];
        if (!dayEnum) return;

        // Parse Time
        const start = parseTime(startRaw);
        const end = parseTime(endRaw);

        if (isNaN(start.h) || isNaN(start.m) || isNaN(end.h) || isNaN(end.m)) {
            // console.warn(`Skipping line ${idx + 1}: Invalid time ${startRaw} - ${endRaw}`);
            return;
        }

        if (!coursesMap.has(code)) {
            coursesMap.set(code, {
                code,
                name,
                isMTHS: code.startsWith('MTHS'),
                sections: []
            });
        }

        const course = coursesMap.get(code);

        // Add section generation code string
        // createSection(code, type, group, day, sH, sM, eH, eM, location)
        // Clean location: escape quotes
        const safeLoc = location ? location.replace(/'/g, "\\'") : '';

        const sectionStr = `      createSection('${code}', ${typeEnum}, '${group}', ${dayEnum}, ${start.h}, ${start.m}, ${end.h}, ${end.m}, '${safeLoc}')`;
        course.sections.push(sectionStr);
    });

    // Generate output file content
    let output = `
import { Course, SectionType, DayOfWeek, Section } from './types';

// Helper to create sections easily
const createSection = (
  courseCode: string,
  type: SectionType,
  group: string,
  day: DayOfWeek,
  startH: number,
  startM: number,
  endH: number,
  endM: number,
  location?: string
): Section => {
  const startDec = startH + startM / 60;
  const endDec = endH + endM / 60;
  const startStr = \`\${startH.toString().padStart(2, '0')}:\${startM.toString().padStart(2, '0')}\`;
  const endStr = \`\${endH.toString().padStart(2, '0')}:\${endM.toString().padStart(2, '0')}\`;

  return {
    id: \`\${courseCode}-\${type.substring(0, 3)}-\${group}-\${day}-\${startH}\`,
    courseCode,
    type,
    group,
    sessions: [
      {
        day,
        startHour: startDec,
        endHour: endDec,
        startString: startStr,
        endString: endStr,
        location
      },
    ],
  };
};

export const COURSES: Course[] = [`;

    // specific sorting to match original helpful grouping if possible, but code sort is fine
    const sortedCourses = Array.from(coursesMap.values()).sort((a, b) => a.code.localeCompare(b.code));

    sortedCourses.forEach(c => {
        output += `
  {
    code: '${c.code}',
    name: '${c.name.replace(/'/g, "\\'")}',
    isMTHS: ${c.isMTHS},
    sections: [
${c.sections.join(',\n')}
    ]
  },`;
    });

    output += `
];
`;

    fs.writeFileSync(OUT_FILE, output);
    console.log(`Generated ${sortedCourses.length} courses in data.ts`);
}

generateData();
