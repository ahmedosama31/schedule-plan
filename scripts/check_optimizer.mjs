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

const friendBuild = await build({
  entryPoints: ["friendOptimizer.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  write: false,
});
const friendModule = { exports: {} };
vm.runInNewContext(friendBuild.outputFiles[0].text, {
  module: friendModule,
  exports: friendModule.exports,
  console,
  performance,
  Math: deterministicMath,
});
const { optimizeFriendSchedules } = friendModule.exports;

const apiBuild = await build({
  entryPoints: ["lib/api.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  write: false,
});
const apiModule = { exports: {} };
vm.runInNewContext(apiBuild.outputFiles[0].text, {
  module: apiModule,
  exports: apiModule.exports,
  console,
  performance,
  Math: deterministicMath,
  fetch: () => { throw new Error("Optimizer tests must not perform network requests"); },
});
const { resolveSectionId } = apiModule.exports;
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

const selectableCourse = (code, sections, isMTHS = false) => ({
  code,
  name: code,
  isMTHS,
  sections: sections.map(({ id, type = "Lecture", group, day, start }) => ({
    id,
    legacyIds: [`legacy-${id}`],
    courseCode: code,
    type,
    group,
    sessions: [{
      day,
      startHour: start,
      endHour: start + 1,
      startString: `${String(start).padStart(2, "0")}:00`,
      endString: `${String(start + 1).padStart(2, "0")}:00`,
    }],
  })),
});

const sharedWithLab = selectableCourse("SHARED101", [
  { id: "shared-lec-a", type: "Lecture", group: "A", day: "Monday", start: 9 },
  { id: "shared-lec-b", type: "Lecture", group: "B", day: "Tuesday", start: 9 },
  { id: "shared-lab-a", type: "Laboratory", group: "A", day: "Wednesday", start: 9 },
  { id: "shared-lab-b", type: "Laboratory", group: "B", day: "Thursday", start: 9 },
]);
assert.equal(
  resolveSectionId(sharedWithLab, "legacy-shared-lec-a"),
  "shared-lec-a",
  "Legacy saved section IDs must resolve to the canonical ID before matching",
);
const defaultFriendInput = selections => ({
  selections,
  preferences: { preferConsecutive: true, avoidDays: [], noLongDays: false, excludeSingleSessionDays: false },
});
const maximumMatch = optimizeFriendSchedules(
  defaultFriendInput([{ course: sharedWithLab }]),
  defaultFriendInput([{ course: sharedWithLab }]),
  "maximum-matches",
  5,
);
assert.equal(maximumMatch.options[0].matchableCount, 1, "Labs must not count as matchable sections");
assert.equal(maximumMatch.options[0].matchCount, 1, "Maximum mode should choose the same lecture");
assert.equal(maximumMatch.options[0].matchedSections.length, 1, "Matched details must exclude labs");
assert.equal(maximumMatch.options[0].matchedSections[0].section.id, "shared-lec-a", "Friend ordering must be deterministic");

const repeatedMaximum = optimizeFriendSchedules(
  defaultFriendInput([{ course: sharedWithLab }]),
  defaultFriendInput([{ course: sharedWithLab }]),
  "maximum-matches",
  5,
);
assert.deepEqual(
  maximumMatch.options.map(option => `${signature(option.student1)}##${signature(option.student2)}`),
  repeatedMaximum.options.map(option => `${signature(option.student1)}##${signature(option.student2)}`),
  "Friend optimizer output must be deterministic",
);

const mthsCourse = selectableCourse("MTHS999", [
  { id: "mths-g1-lec", type: "Lecture", group: "1", day: "Monday", start: 10 },
  { id: "mths-g1-tut", type: "Tutorial", group: "1", day: "Tuesday", start: 10 },
  { id: "mths-g2-lec", type: "Lecture", group: "2", day: "Wednesday", start: 10 },
  { id: "mths-g2-tut", type: "Tutorial", group: "2", day: "Thursday", start: 10 },
], true);
const mthsMatch = optimizeFriendSchedules(
  defaultFriendInput([{ course: mthsCourse }]),
  defaultFriendInput([{ course: mthsCourse }]),
  "maximum-matches",
  1,
).options[0];
assert.equal(mthsMatch.matchableCount, 2, "MTHS lecture and tutorial must be independently matchable");
assert.equal(mthsMatch.matchCount, 2, "Matching an MTHS group should match its lecture and tutorial");

const independentPrefsCourse = selectableCourse("PREF101", [
  { id: "pref-mon", type: "Lecture", group: "M", day: "Monday", start: 9 },
  { id: "pref-tue", type: "Lecture", group: "T", day: "Tuesday", start: 9 },
]);
const independentPrefs = optimizeFriendSchedules(
  {
    selections: [{ course: independentPrefsCourse }],
    preferences: { preferConsecutive: true, avoidDays: ["Monday"] },
  },
  {
    selections: [{ course: independentPrefsCourse, selectedLectureId: "pref-mon", lockedLecture: true }],
    preferences: { preferConsecutive: true, avoidDays: [] },
  },
  "maximum-matches",
  1,
).options[0];
assert.equal(independentPrefs.student1.choices[0].lectureId, "pref-tue", "Student 1 preferences must apply independently");
assert.equal(independentPrefs.student2.choices[0].lectureId, "pref-mon", "Student 2 locks must apply independently");
assert.equal(independentPrefs.matchCount, 0, "Independent constraints may prevent a match");

const noCommon = optimizeFriendSchedules(
  defaultFriendInput([{ course: fixedCourse("ONLY1", 9, 10) }]),
  defaultFriendInput([{ course: fixedCourse("ONLY2", 9, 10) }]),
  "balanced",
  1,
).options[0];
assert.equal(noCommon.matchableCount, 0);
assert.equal(noCommon.matchCount, 0);
assert.equal(noCommon.balancedScore, 0.5, "With no common courses, balanced mode should rank normal schedule quality");

for (const option of maximumMatch.options) {
  assert.equal(
    option.balancedScore,
    0.5 * option.matchRatio + 0.5 * option.pairQuality,
    "Balanced score must remain a fixed 50/50 blend",
  );
}

console.log(JSON.stringify({
  course: course.code,
  rejectedOverlap: `${lecture.id} + ${tutorial.id}`,
  deterministicOptionsChecked: firstRun.length,
  passingTimeGapHours: passingTimeOnly.gapScore,
  freeSlotGapHours: oneFreeHour.gapScore,
  noLongDaysConstraint: "passed",
  friendOptimizer: {
    maximumSharedSections: maximumMatch.options[0].matchCount,
    mthsSharedSections: mthsMatch.matchCount,
    labsExcluded: true,
    independentPreferencesAndLocks: true,
  },
}));
