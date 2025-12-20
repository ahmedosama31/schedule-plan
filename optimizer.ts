/**
 * Schedule Optimizer
 * 
 * Finds optimal section combinations that minimize attendance days
 * and prefer shorter gaps between classes.
 */

import { Course, CourseSelection, Section, SectionType, DayOfWeek, ClassSession } from './types';
import { SchedulePreferences, DEFAULT_PREFERENCES } from './preferences';

/**
 * Represents a possible section choice for a single course.
 * Contains all selected sections (lecture, tutorial, lab, or MTHS group).
 */
export interface CourseChoice {
    course: Course;
    sections: Section[];
    lectureId?: string;
    tutorialId?: string;
    labId?: string;
    mthsGroup?: string;
}

/**
 * Represents a complete schedule (all courses with their section choices).
 */
export interface ScheduleOption {
    choices: CourseChoice[];
    daysUsed: DayOfWeek[];
    dayCount: number;
    gapScore: number;       // Lower is better (less gap time)
    hasConflicts: boolean;
    conflicts: ConflictInfo[];
    healthScore: number; // 0-100 score indicating schedule quality
    flags: string[]; // Descriptive tags for why this schedule is good/bad
}

export interface ConflictInfo {
    course1: string;
    course2: string;
    section1Type: string;
    section2Type: string;
    day: DayOfWeek;
    time: string;
}

// Day order for sorting
const DAY_ORDER: DayOfWeek[] = [
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday
];

/**
 * Gets all possible section combinations for a single course.
 * For non-MTHS courses: all combos of (lecture × tutorial × lab)
 * For MTHS courses: all group options
 */
function getAllChoicesForCourse(course: Course): CourseChoice[] {
    const choices: CourseChoice[] = [];

    if (course.isMTHS) {
        // MTHS courses: each group is a choice
        const groups = Array.from(new Set(course.sections.map(s => s.group))).sort();
        for (const group of groups) {
            const sections = course.sections.filter(s => s.group === group);
            choices.push({
                course,
                sections,
                mthsGroup: group
            });
        }
    } else {
        // Regular courses: generate cartesian product of section types
        const lectures = course.sections.filter(s => s.type === SectionType.Lecture);
        const tutorials = course.sections.filter(s => s.type === SectionType.Tutorial);
        const labs = course.sections.filter(s => s.type === SectionType.Lab);

        // If no lectures, add empty placeholder
        const lecOptions = lectures.length > 0 ? lectures : [null];
        const tutOptions = tutorials.length > 0 ? tutorials : [null];
        const labOptions = labs.length > 0 ? labs : [null];

        for (const lec of lecOptions) {
            for (const tut of tutOptions) {
                for (const lab of labOptions) {
                    const sections: Section[] = [];
                    if (lec) sections.push(lec);
                    if (tut) sections.push(tut);
                    if (lab) sections.push(lab);

                    // Skip if no sections at all
                    if (sections.length === 0) continue;

                    choices.push({
                        course,
                        sections,
                        lectureId: lec?.id,
                        tutorialId: tut?.id,
                        labId: lab?.id
                    });
                }
            }
        }
    }

    return choices;
}

/**
 * Checks if two sessions overlap in time.
 */
function sessionsOverlap(s1: ClassSession, s2: ClassSession): boolean {
    if (s1.day !== s2.day) return false;
    return s1.startHour < s2.endHour && s2.startHour < s1.endHour;
}

/**
 * Finds all conflicts within a set of course choices.
 */
// Export for external use
export function findConflicts(choices: CourseChoice[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const allSessions: Array<{ course: string; section: Section; session: ClassSession }> = [];

    // Flatten all sessions
    for (const choice of choices) {
        for (const section of choice.sections) {
            for (const session of section.sessions) {
                allSessions.push({
                    course: choice.course.code,
                    section,
                    session
                });
            }
        }
    }

    // Check all pairs
    for (let i = 0; i < allSessions.length; i++) {
        for (let j = i + 1; j < allSessions.length; j++) {
            const a = allSessions[i];
            const b = allSessions[j];

            // Skip if same course
            if (a.course === b.course) continue;

            if (sessionsOverlap(a.session, b.session)) {
                conflicts.push({
                    course1: a.course,
                    course2: b.course,
                    section1Type: a.section.type,
                    section2Type: b.section.type,
                    day: a.session.day,
                    time: `${a.session.startString}-${a.session.endString}`
                });
            }
        }
    }

    return conflicts;
}

/**
 * Gets all unique days used by a set of course choices.
 */
function getDaysUsed(choices: CourseChoice[]): DayOfWeek[] {
    const days = new Set<DayOfWeek>();
    for (const choice of choices) {
        for (const section of choice.sections) {
            for (const session of section.sessions) {
                days.add(session.day);
            }
        }
    }
    return DAY_ORDER.filter(d => days.has(d));
}

/**
 * Calculates the total gap time between classes on the same day.
 * Lower score = less idle time = better.
 */
function calculateGapScore(choices: CourseChoice[]): number {
    // Group sessions by day
    const sessionsByDay = new Map<DayOfWeek, { start: number; end: number }[]>();

    for (const choice of choices) {
        for (const section of choice.sections) {
            for (const session of section.sessions) {
                if (!sessionsByDay.has(session.day)) {
                    sessionsByDay.set(session.day, []);
                }
                sessionsByDay.get(session.day)!.push({
                    start: session.startHour,
                    end: session.endHour
                });
            }
        }
    }

    let totalGap = 0;

    for (const [, sessions] of sessionsByDay) {
        if (sessions.length <= 1) continue;

        // Sort by start time
        sessions.sort((a, b) => a.start - b.start);

        // Calculate gaps between consecutive sessions
        for (let i = 1; i < sessions.length; i++) {
            const gap = sessions[i].start - sessions[i - 1].end;
            if (gap > 0) {
                totalGap += gap;
            }
        }
    }

    return totalGap;
}

/**
 * Generator that lazily yields Cartesian product combinations.
 * Significantly more memory efficient than generating all combinations array.
 */
function* generateCombinations<T>(arrays: T[][]): Generator<T[]> {
    if (arrays.length === 0) {
        yield [];
        return;
    }

    const [first, ...rest] = arrays;

    if (rest.length === 0) {
        for (const item of first) {
            yield [item];
        }
        return;
    }

    for (const item of first) {
        for (const dims of generateCombinations(rest)) {
            yield [item, ...dims];
        }
    }
}

/**
 * Checks if a schedule violates hard preference constraints.
 * Returns true if the schedule should be EXCLUDED.
 */
function violatesHardConstraints(choices: CourseChoice[], prefs: SchedulePreferences): boolean {
    for (const choice of choices) {
        for (const section of choice.sections) {
            for (const session of section.sessions) {
                // Check "no classes before" constraint
                if (prefs.noClassesBefore !== undefined && session.startHour < prefs.noClassesBefore) {
                    return true;
                }
                // Check "no classes after" constraint
                if (prefs.noClassesAfter !== undefined && session.endHour > prefs.noClassesAfter) {
                    return true;
                }
                // Check "avoid days" constraint
                if (prefs.avoidDays && prefs.avoidDays.includes(session.day)) {
                    return true;
                }
            }
        }
    }

    // Check "exclude single session days" constraint
    if (prefs.excludeSingleSessionDays) {
        // Count lectures and tutorials per day
        const sessionsPerDay = new Map<DayOfWeek, number>();

        for (const choice of choices) {
            for (const section of choice.sections) {
                // Only count lectures and tutorials, not labs
                if (section.type === SectionType.Lecture || section.type === SectionType.Tutorial) {
                    for (const session of section.sessions) {
                        sessionsPerDay.set(
                            session.day,
                            (sessionsPerDay.get(session.day) || 0) + 1
                        );
                    }
                }
            }
        }

        // Check if any day has only 1 session
        for (const [, count] of sessionsPerDay) {
            if (count === 1) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Main optimization function.
 * Generates combinations lazily, scores them, and returns the top N.
 * Respects locked selections - locked sections are kept fixed.
 * 
 * @param courses - Array of courses to optimize
 * @param topN - Number of top results to return (default 5)
 * @param preferences - User preferences for filtering and scoring
 * @param lockedSelections - Optional array of selections with lock flags
 * @returns Sorted array of ScheduleOption, best first
 */
export function optimizeSchedule(
    courses: Course[],
    topN: number = 10,
    preferences: SchedulePreferences = DEFAULT_PREFERENCES,
    lockedSelections?: CourseSelection[]
): ScheduleOption[] {
    if (courses.length === 0) return [];

    // Get all choices for each course, respecting locked selections
    const choicesPerCourse = courses.map(c => {
        const lockedSel = lockedSelections?.find(s => s.course.code === c.code);

        // Check if this course has any locked sections
        const hasLockedSections = lockedSel && (
            lockedSel.lockedLecture ||
            lockedSel.lockedTutorial ||
            lockedSel.lockedLab ||
            lockedSel.lockedMthsGroup
        );

        if (hasLockedSections && lockedSel) {
            // Build fixed choice from locked selections
            const sections: Section[] = [];
            let lectureId = lockedSel.lockedLecture ? lockedSel.selectedLectureId : undefined;
            let tutorialId = lockedSel.lockedTutorial ? lockedSel.selectedTutorialId : undefined;
            let labId = lockedSel.lockedLab ? lockedSel.selectedLabId : undefined;
            let mthsGroup = lockedSel.lockedMthsGroup ? lockedSel.selectedMthsGroup : undefined;

            if (c.isMTHS && mthsGroup) {
                // MTHS: use the locked group
                const mthsSections = c.sections.filter(s => s.group === mthsGroup);
                sections.push(...mthsSections);
                return [{ course: c, sections, mthsGroup }];
            } else {
                // Regular course: mix locked and unlocked sections
                const allChoices = getAllChoicesForCourse(c);

                // Filter choices to only those matching locked sections
                const filteredChoices = allChoices.filter(choice => {
                    if (lectureId && choice.lectureId !== lectureId) return false;
                    if (tutorialId && choice.tutorialId !== tutorialId) return false;
                    if (labId && choice.labId !== labId) return false;
                    return true;
                });

                return filteredChoices.length > 0 ? filteredChoices : allChoices;
            }
        } else {
            // No locked sections, generate all choices
            return getAllChoicesForCourse(c);
        }
    });

    // Check for empty choices
    if (choicesPerCourse.some(choices => choices.length === 0)) {
        return [];
    }

    // Use generator to iterate combinations without creating massive array
    const generator = generateCombinations(choicesPerCourse);

    // Limits
    const MAX_COMBINATIONS_CHECKED = 2000000; // Increased to 2M to find deeper options
    const MAX_VALID_SCHEDULES = 5000; // Increased to 5k
    const MAX_TIME_MS = 2000; // stop after 2 seconds to prevent freezing
    const startTime = performance.now();

    let checkedCount = 0;
    const validOptions: ScheduleOption[] = [];

    // DEBUG: Log preferences
    console.log('Optimizer called with preferences:', JSON.stringify(preferences));

    for (const choices of generator) {
        checkedCount++;

        // Check limits
        if (checkedCount > MAX_COMBINATIONS_CHECKED) break;
        if (validOptions.length >= MAX_VALID_SCHEDULES) break;

        // Time check every 1000 items to avoid perf hit
        if (checkedCount % 1000 === 0 && (performance.now() - startTime > MAX_TIME_MS)) {
            console.log('Optimizer time limit reached');
            break;
        }

        // 1. Check hard constraints (filtering)
        if (violatesHardConstraints(choices, preferences)) {
            continue;
        }

        // 2. Check conflicts
        const conflicts = findConflicts(choices);
        if (conflicts.length > 0) {
            continue; // Skip conflicting schedules
        }

        // 3. Analyze and Score
        const daysUsed = getDaysUsed(choices);
        const gapScore = calculateGapScore(choices);
        const { score: healthScore, flags } = calculateHealthAndFlags(choices, daysUsed);

        validOptions.push({
            choices,
            daysUsed,
            dayCount: daysUsed.length,
            gapScore,
            healthScore,
            hasConflicts: false,
            conflicts: [],
            flags
        });
    }

    console.log(`Checked ${checkedCount} combinations. Found ${validOptions.length} valid schedules.`);

    // Sort by:
    // 1. Health Score (Higher is better) - PRIMARY
    // 2. Fewer days is better (Secondary)
    // 3. Lower gap score is better (Tertiary)
    validOptions.sort((a, b) => {
        // 1. Health Score (Higher is better)
        if (a.healthScore !== b.healthScore) {
            return b.healthScore - a.healthScore;
        }

        // 2. Day Count
        if (a.dayCount !== b.dayCount) {
            return a.dayCount - b.dayCount;
        }

        // 3. Gap Score (Lower is better)
        return a.gapScore - b.gapScore;
    });

    // Return unique top N results
    return validOptions.slice(0, topN);
}

/**
 * Calculates a 'Health Score' (0-100) and generates descriptive flags.
 */
function calculateHealthAndFlags(choices: CourseChoice[], daysUsed: DayOfWeek[]): { score: number, flags: string[] } {
    let score = 100;
    const flags: string[] = [];

    const sessionsByDay = new Map<DayOfWeek, { start: number; end: number }[]>();

    // 1. Populate daily sessions
    for (const choice of choices) {
        for (const section of choice.sections) {
            for (const session of section.sessions) {
                if (!sessionsByDay.has(session.day)) sessionsByDay.set(session.day, []);
                sessionsByDay.get(session.day)!.push({
                    start: session.startHour,
                    end: session.endHour
                });
            }
        }
    }

    // 2. Analyze each day
    let totalDayDuration = 0;
    let dayDurations: number[] = [];
    let hasEarlyStart = false;
    let hasLateEnd = false;
    let hasLongDay = false;
    let hasHugeGap = false;
    let hasGruelingBlock = false;

    for (const [day, sessions] of sessionsByDay) {
        if (sessions.length === 0) continue;
        sessions.sort((a, b) => a.start - b.start);

        const firstStart = sessions[0].start;
        const lastEnd = sessions[sessions.length - 1].end;
        const duration = lastEnd - firstStart;

        totalDayDuration += duration;
        dayDurations.push(duration);

        // -- Penalties --

        // Early Start Penalty (before 9:00 AM)
        if (firstStart < 9 && lastEnd > 13) {
            score -= 5;
            hasEarlyStart = true;
        }

        // Late End Penalty (after 5:00 PM / 17:00)
        if (lastEnd > 17) {
            score -= 5;
            hasLateEnd = true;
        }

        // Long Day Penalty
        if (duration > 9) {
            score -= 15;
            hasLongDay = true;
        }

        // Continuous blocks check
        let maxContinuousBlock = 0;
        let currentBlock = 0;

        for (let i = 0; i < sessions.length; i++) {
            const current = sessions[i];
            const duration = current.end - current.start;

            if (i > 0) {
                const prev = sessions[i - 1];
                const gap = current.start - prev.end;

                if (gap > 0) {
                    currentBlock = 0;
                    if (gap > 3) {
                        score -= 8;
                        hasHugeGap = true;
                    }
                }
            }
            currentBlock += duration;
            maxContinuousBlock = Math.max(maxContinuousBlock, currentBlock);
        }

        if (maxContinuousBlock > 4) {
            score -= 15;
            hasGruelingBlock = true;
        }
    }

    // 3. Balance Bonus
    let isBalanced = false;
    if (dayDurations.length > 1) {
        const mean = totalDayDuration / dayDurations.length;
        const variance = dayDurations.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / dayDurations.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < 1.2) {
            score += 5;
            isBalanced = true;
        }
        if (stdDev > 3) score -= 5;
    }

    // 4. Free Day Bonus
    const daysOffCount = 5 - daysUsed.length; // Assuming 5 day standard week for "days off" metric (Sat-Wed or Sun-Thu context?)
    // Actually just use daysUsed.length

    if (daysUsed.length <= 3) {
        score += 20;
    } else if (daysUsed.length <= 4) {
        score += 10;
    }

    // 5. Total Gap Penalty
    let totalGapHours = 0;
    for (const [day, sessions] of sessionsByDay) {
        if (sessions.length <= 1) continue;
        sessions.sort((a, b) => a.start - b.start);
        for (let i = 1; i < sessions.length; i++) {
            const gap = sessions[i].start - sessions[i - 1].end;
            if (gap > 0) totalGapHours += gap;
        }
    }
    score -= Math.round(totalGapHours * 2);

    // --- Generate Flags ---
    // Only positive flags for "Why is this better?"

    // Primary: Day Count (Most important)
    if (daysUsed.length <= 3) {
        flags.push("3 Days Only");
    } else if (daysUsed.length <= 4) {
        flags.push("4 Days Only");
    }

    // Secondary: Time conveniences
    if (!hasEarlyStart) flags.push("Late Mornings"); // No 8am/9am starts
    if (!hasLateEnd) flags.push("Early Finish"); // Ends by 5pm

    // Tertiary: Schedule density/feel
    if (totalGapHours < 1.0) flags.push("Compact"); // Little to no gaps
    if (isBalanced) flags.push("Balanced"); // Even spread of work
    if (!hasLongDay && !hasGruelingBlock) flags.push("Relaxed Pace"); // No 10h+ days or 4h+ continuous blocks

    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        flags
    };
}

/**
 * Converts a ScheduleOption to an array of CourseSelection objects
 * that can be used directly with the existing app state.
 */
export function optionToSelections(option: ScheduleOption): CourseSelection[] {
    return option.choices.map(choice => {
        const selection: CourseSelection = {
            course: choice.course,
        };

        if (choice.mthsGroup) {
            selection.selectedMthsGroup = choice.mthsGroup;
        } else {
            if (choice.lectureId) selection.selectedLectureId = choice.lectureId;
            if (choice.tutorialId) selection.selectedTutorialId = choice.tutorialId;
            if (choice.labId) selection.selectedLabId = choice.labId;
        }

        return selection;
    });
}

/**
 * Helper to convert selections to choices for conflict checking.
 */
export function selectionsToChoices(selections: CourseSelection[]): CourseChoice[] {
    return selections.map(sel => {
        const sections: Section[] = [];
        const c = sel.course;

        if (c.isMTHS && sel.selectedMthsGroup) {
            const mthsSections = c.sections.filter(s => s.group === sel.selectedMthsGroup);
            sections.push(...mthsSections);
            return { course: c, sections, mthsGroup: sel.selectedMthsGroup };
        } else {
            if (sel.selectedLectureId) {
                const s = c.sections.find(s => s.id === sel.selectedLectureId);
                if (s) sections.push(s);
            }
            if (sel.selectedTutorialId) {
                const s = c.sections.find(s => s.id === sel.selectedTutorialId);
                if (s) sections.push(s);
            }
            if (sel.selectedLabId) {
                const s = c.sections.find(s => s.id === sel.selectedLabId);
                if (s) sections.push(s);
            }
            return {
                course: c,
                sections,
                lectureId: sel.selectedLectureId,
                tutorialId: sel.selectedTutorialId,
                labId: sel.selectedLabId
            };
        }
    });
}
