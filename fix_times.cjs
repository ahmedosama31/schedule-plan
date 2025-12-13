const fs = require('fs');
const path = require('path');

// Read the data.ts file
const dataPath = path.join(__dirname, 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

let fixCount = 0;

// Fix pattern: createSection(..., startH, startM, endH, endM, ...)
const createSectionRegex = /createSection\(([^,]+),\s*([^,]+),\s*'([^']+)',\s*([^,]+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*([^)]+)\)/g;

content = content.replace(createSectionRegex, (match, courseCode, sectionType, group, day, startH, startM, endH, endM, location) => {
    const startHour = parseInt(startH);
    const endHour = parseInt(endH);

    // Case 1: Start is normal (>=7), End is wrapped (1-6) -> Fix End (PM wrap)
    // e.g., 10:00 to 1:50 -> 10:00 to 13:50
    if (startHour >= 7 && endHour <= 6) {
        const fixedEndH = endHour + 12;
        fixCount++;
        console.log(`Fixed End: ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${startH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${startH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    // Case 2: Start is noon (12), End is wrapped (1-6) -> Fix End (PM wrap)
    // e.g., 12:00 to 1:50 -> 12:00 to 13:50
    if (startHour === 12 && endHour >= 1 && endHour <= 6) {
        const fixedEndH = endHour + 12;
        fixCount++;
        console.log(`Fixed End (Noon): ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${startH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${startH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    // Case 3: Start is small (1-6), End is small (1-6) -> Fix BOTH (12-hr format used as 24-hr)
    // e.g., MEES280: 4:00 to 4:50 -> 16:00 to 16:50
    // Assuming no classes align between 1 AM and 6 AM.
    if (startHour >= 1 && startHour <= 6) {
        const fixedStartH = startHour + 12;
        // Check if end hour also needs fixing (usually yes if it's <= 6)
        // If end hour is somehow 12 or > 6 (unlikely for short PM classes starting 1-6), handle carefully.
        // If start is 4 (16:00) and end is 5 (17:00), end needs +12 too.
        const fixedEndH = (endHour <= 6) ? endHour + 12 : endHour;

        fixCount++;
        console.log(`Fixed Both: ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${fixedStartH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${fixedStartH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    return match;
});

// Write the fixed content back
fs.writeFileSync(dataPath, content, 'utf8');

console.log(`\n✅ Fixed ${fixCount} time entries in data.ts`);
