import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { build } from "esbuild";

const result = await build({
  entryPoints: ["optimizer.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  write: false,
});

const module = { exports: {} };
const deterministicMath = Object.create(Math);
deterministicMath.random = () => {
  throw new Error("Optimizer must not use Math.random()");
};
vm.runInNewContext(result.outputFiles[0].text, {
  module,
  exports: module.exports,
  console,
  performance,
  Math: deterministicMath,
});

const { findConflicts, optimizeSchedule } = module.exports;
const catalog = JSON.parse(await fs.readFile("data/semesters/fall-2026-27.json", "utf8"));
const course = catalog.find(item => item.code === "EECS306");
assert(course, "EECS306 must exist in the Fall catalog");

const lecture = course.sections.find(section => section.id === "EECS306-lec-3");
const tutorial = course.sections.find(section => section.id === "EECS306-tut-4");
assert(lecture && tutorial, "Expected EECS306 regression sections were not found");

const conflicts = findConflicts([{ course, sections: [lecture, tutorial] }]);
assert.equal(conflicts.length, 1, "Same-course lecture/tutorial overlap must be rejected");
assert.equal(conflicts[0].course1, "EECS306");
assert.equal(conflicts[0].course2, "EECS306");

const signature = option => option.choices.map(choice => [
  choice.course.code,
  choice.lectureId || "",
  choice.tutorialId || "",
  choice.labId || "",
  choice.mthsGroup || "",
].join(":")).join("|");

const firstRun = optimizeSchedule([course], 20).map(signature);
const secondRun = optimizeSchedule([course], 20).map(signature);
assert.deepEqual(firstRun, secondRun, "Repeated optimizer runs must return identical ordering");
assert(!firstRun.includes("EECS306:EECS306-lec-3:EECS306-tut-4::"));

const fixedCourse = (code, startHour, endHour) => ({
  code,
  name: code,
  isMTHS: false,
  sections: [{
    id: `${code}-lec-1`,
    courseCode: code,
    type: "Lecture",
    group: "1",
    sessions: [{
      day: "Wednesday",
      startHour,
      endHour,
      startString: `${String(Math.floor(startHour)).padStart(2, "0")}:00`,
      endString: `${String(Math.floor(endHour)).padStart(2, "0")}:50`,
    }],
  }],
});

const passingTimeOnly = optimizeSchedule([
  fixedCourse("TEST101", 8, 10 + 50 / 60),
  fixedCourse("TEST102", 11, 12 + 50 / 60),
  fixedCourse("TEST103", 13, 15 + 50 / 60),
  fixedCourse("TEST104", 16, 17 + 50 / 60),
], 1)[0];
assert.equal(passingTimeOnly.gapScore, 0, "Ten-minute passing periods must not count as gaps");

const oneFreeHour = optimizeSchedule([
  fixedCourse("TEST201", 8, 10 + 50 / 60),
  fixedCourse("TEST202", 12, 13 + 50 / 60),
], 1)[0];
assert.equal(oneFreeHour.gapScore, 1, "10:50 to 12:00 should count as one free timetable hour");

const longDayCourses = [
  fixedCourse("TEST301", 8, 9),
  fixedCourse("TEST302", 17, 18),
];
assert.equal(optimizeSchedule(longDayCourses, 1).length, 1, "Long days remain available by default");
assert.equal(
  optimizeSchedule(longDayCourses, 1, { preferConsecutive: true, noLongDays: true }).length,
  0,
  "No long days must exclude schedules spanning more than nine hours",
);

const nineHourDay = [
  fixedCourse("TEST401", 8, 9),
  fixedCourse("TEST402", 16, 17),
];
assert.equal(
  optimizeSchedule(nineHourDay, 1, { preferConsecutive: true, noLongDays: true }).length,
  1,
  "A day spanning exactly nine hours is allowed",
);

console.log(JSON.stringify({
  course: course.code,
  rejectedOverlap: `${lecture.id} + ${tutorial.id}`,
  deterministicOptionsChecked: firstRun.length,
  passingTimeGapHours: passingTimeOnly.gapScore,
  freeSlotGapHours: oneFreeHour.gapScore,
  noLongDaysConstraint: "passed",
}));
