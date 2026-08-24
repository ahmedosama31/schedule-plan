import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { transform } from "esbuild";

const [revision, sourcePath, outputPath] = process.argv.slice(2);
if (!revision || !sourcePath || !outputPath) {
  throw new Error("Usage: archive_git_catalog.mjs <git-revision> <source-path> <output.json>");
}

const git = process.env.GIT_EXECUTABLE || "git";
let source = execFileSync(git, ["show", `${revision}:${sourcePath}`], { encoding: "utf8" });
source = source.replace(
  /^import\s+\{[^\n]+\}\s+from\s+['"]\.\/types['"];?\s*/m,
  `const SectionType = { Lecture: 'Lecture', Tutorial: 'Tutorial', Lab: 'Laboratory' };\n` +
  `const DayOfWeek = { Saturday: 'Saturday', Sunday: 'Sunday', Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday' };\n`,
);

const compiled = await transform(source, { loader: "ts", format: "cjs", target: "es2022" });
const module = { exports: {} };
vm.runInNewContext(compiled.code, { module, exports: module.exports }, { filename: sourcePath });
const courses = module.exports.COURSES;
if (!Array.isArray(courses) || courses.length === 0) {
  throw new Error(`No COURSES array found in ${revision}:${sourcePath}`);
}

const clockString = value => {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};
for (const course of courses) {
  for (const section of course.sections || []) {
    for (const session of section.sessions || []) {
      if (session.startHour >= 1 && session.startHour < 8) session.startHour += 12;
      if (session.endHour >= 1 && session.endHour < 8) session.endHour += 12;
      if (session.endHour <= session.startHour) session.endHour += 12;
      session.startString = clockString(session.startHour);
      session.endString = clockString(session.endHour);
    }
  }
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(courses, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ revision, sourcePath, outputPath, courses: courses.length }));
