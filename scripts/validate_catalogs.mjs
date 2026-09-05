import fs from "node:fs/promises";
import path from "node:path";

const directory = path.resolve("data/semesters");
const files = (await fs.readdir(directory))
  .filter(file => file.endsWith(".json") && !file.endsWith(".meta.json"))
  .sort();
const validDays = new Set(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]);
const validTypes = new Set(["Lecture", "Tutorial", "Laboratory"]);
const failures = [];
const summaries = [];

for (const file of files) {
  const courses = JSON.parse(await fs.readFile(path.join(directory, file), "utf8"));
  const courseCodes = new Set();
  const sectionIds = new Set();
  let sectionCount = 0;
  let sessionCount = 0;

  if (!Array.isArray(courses) || courses.length === 0) failures.push(`${file}: catalog must be a non-empty array`);
  for (const course of courses) {
    if (!course.code || !course.name || !Array.isArray(course.sections)) failures.push(`${file}: malformed course`);
    if (courseCodes.has(course.code)) failures.push(`${file}: duplicate course ${course.code}`);
    courseCodes.add(course.code);
    for (const section of course.sections || []) {
      sectionCount += 1;
      if (sectionIds.has(section.id)) failures.push(`${file}: duplicate section id ${section.id}`);
      sectionIds.add(section.id);
      if (section.courseCode !== course.code) failures.push(`${file}: ${section.id} has mismatched courseCode`);
      if (!validTypes.has(section.type)) failures.push(`${file}: ${section.id} has invalid type ${section.type}`);
      if (!Array.isArray(section.sessions) || section.sessions.length === 0) failures.push(`${file}: ${section.id} has no sessions`);
      for (const session of section.sessions || []) {
        sessionCount += 1;
        if (!validDays.has(session.day)) failures.push(`${file}: ${section.id} has invalid day ${session.day}`);
        if (!(session.startHour >= 0 && session.endHour <= 24 && session.endHour > session.startHour)) {
          failures.push(`${file}: ${section.id} has invalid time ${session.startHour}-${session.endHour}`);
        }
      }
    }
  }

  if (file === "fall-2026-27.json") {
    for (const code of ["CMPS457", "CMPS458", "EECS101", "GENS249", "MTHS102"]) {
      if (!courseCodes.has(code)) failures.push(`${file}: expected course ${code} is missing`);
    }
    if (courses.length !== 206 || sectionCount !== 618 || sessionCount !== 619) {
      failures.push(`${file}: expected 206 courses / 618 sections / 619 sessions, got ${courses.length} / ${sectionCount} / ${sessionCount}`);
    }
  }
  summaries.push({ file, courses: courses.length, sections: sectionCount, sessions: sessionCount });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(summaries, null, 2));
}
