const fs = require('fs');
const path = require('path');

// Read the data.ts file
const dataPath = path.join(__dirname, 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

let fixCount = 0;

// Fix pattern: When end hour (1-6) is less than start hour (7-12), add 12 to end hour
// Pattern: createSection(..., startH, startM, endH, endM, ...)
// We need to find cases where startH >= 7 and endH <= 6

const createSectionRegex = /createSection\(([^,]+),\s*([^,]+),\s*'([^']+)',\s*([^,]+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*([^)]+)\)/g;

content = content.replace(createSectionRegex, (match, courseCode, sectionType, group, day, startH, startM, endH, endM, location) => {
    const startHour = parseInt(startH);
    const endHour = parseInt(endH);

    // If start hour is >= 7 and end hour is <= 6, it's likely PM time in 12-hour format
    // Also check if start is 12 (noon) and end is 1-6 (afternoon)
    if ((startHour >= 7 && endHour <= 6) || (startHour === 12 && endHour >= 1 && endHour <= 6)) {
        const fixedEndH = endHour + 12;
        fixCount++;
        console.log(`Fixed: ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${startH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${startH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    return match;
});

// Write the fixed content back
fs.writeFileSync(dataPath, content, 'utf8');

console.log(`\n✅ Fixed ${fixCount} time entries in data.ts`);
