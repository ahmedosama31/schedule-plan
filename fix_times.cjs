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

    // Classes shown from 1:00 through 7:59 are afternoon/evening slots.
    // The portal uses 12-hour times without an AM/PM suffix and morning classes
    // begin at 8:00, so both ends of these slots need converting to 24-hour time.
    if (startHour >= 1 && startHour <= 7) {
        const fixedStartH = startHour + 12;
        const fixedEndH = endHour >= 1 && endHour <= 7 ? endHour + 12 : endHour;
        fixCount++;
        console.log(`Fixed PM slot: ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${fixedStartH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${fixedStartH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    // Morning/noon classes can wrap into a 1:00-7:59 PM end time.
    // e.g., 10:00 to 1:50 -> 10:00 to 13:50
    if (startHour >= 8 && endHour >= 1 && endHour <= 7) {
        const fixedEndH = endHour + 12;
        fixCount++;
        console.log(`Fixed wrapped end: ${courseCode.trim()} - ${startH}:${startM} to ${endH}:${endM} => ${startH}:${startM} to ${fixedEndH}:${endM}`);
        return `createSection(${courseCode}, ${sectionType}, '${group}', ${day}, ${startH}, ${startM}, ${fixedEndH}, ${endM}, ${location})`;
    }

    return match;
});

// Write the fixed content back
fs.writeFileSync(dataPath, content, 'utf8');

console.log(`\n✅ Fixed ${fixCount} time entries in data.ts`);
