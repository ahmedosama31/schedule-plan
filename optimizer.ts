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
function findConflicts(choices: CourseChoice[]): ConflictInfo[] {
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
 * Generates cartesian product of multiple arrays.
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];

    return arrays.reduce<T[][]>(
        (acc, arr) => acc.flatMap(combo => arr.map(item => [...combo, item])),
        [[]]
    );
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
    return false;
}

/**
 * Calculate preference-based penalty score.
 * Higher score = worse (more penalty).
 */
function calculatePreferencePenalty(choices: CourseChoice[], prefs: SchedulePreferences): number {
    let penalty = 0;
    const daysUsed = getDaysUsed(choices);

    // Penalty for exceeding max days (soft constraint)
    if (prefs.maxDaysPerWeek !== undefined && daysUsed.length > prefs.maxDaysPerWeek) {
        penalty += (daysUsed.length - prefs.maxDaysPerWeek) * 10;
    }

    return penalty;
}

/**
 * Main optimization function.
 * Generates all possible schedule combinations, scores them, and returns the top N.
 * 
 * @param courses - Array of courses to optimize
 * @param topN - Number of top results to return (default 5)
 * @param preferences - User preferences for filtering and scoring
 * @returns Sorted array of ScheduleOption, best first
 */
export function optimizeSchedule(
    courses: Course[],
    topN: number = 5,
    preferences: SchedulePreferences = DEFAULT_PREFERENCES
): ScheduleOption[] {
    if (courses.length === 0) return [];

    // Get all choices for each course
    const choicesPerCourse = courses.map(c => getAllChoicesForCourse(c));

    // Check for empty choices (shouldn't happen, but safety check)
    if (choicesPerCourse.some(choices => choices.length === 0)) {
        return [];
    }

    // Generate all combinations (cartesian product)
    const allCombinations = cartesianProduct(choicesPerCourse);

    // Limit to prevent memory issues with too many combinations
    const MAX_COMBINATIONS = 10000;
    const combinationsToProcess = allCombinations.slice(0, MAX_COMBINATIONS);

    // DEBUG: Log preferences
    console.log('Optimizer called with preferences:', JSON.stringify(preferences));
    console.log('Total combinations before filter:', combinationsToProcess.length);

    // Filter by hard constraints first
    const validCombinations = combinationsToProcess.filter(
        choices => !violatesHardConstraints(choices, preferences)
    );

    console.log('Valid combinations after filter:', validCombinations.length);

    // Score each combination
    const options: ScheduleOption[] = validCombinations.map(choices => {
        const conflicts = findConflicts(choices);
        const daysUsed = getDaysUsed(choices);
        const gapScore = calculateGapScore(choices);
        const preferencePenalty = calculatePreferencePenalty(choices, preferences);

        return {
            choices,
            daysUsed,
            dayCount: daysUsed.length,
            gapScore: preferences.preferConsecutive ? gapScore : 0, // Only count gaps if preferred
            hasConflicts: conflicts.length > 0,
            conflicts
        };
    });

    // Sort by:
    // 1. Conflict-free first
    // 2. Fewer days is better
    // 3. Lower gap score is better (if preferConsecutive)
    options.sort((a, b) => {
        // Conflict-free schedules come first
        if (a.hasConflicts !== b.hasConflicts) {
            return a.hasConflicts ? 1 : -1;
        }
        // Fewer days is better
        if (a.dayCount !== b.dayCount) {
            return a.dayCount - b.dayCount;
        }
        // Less gap time is better
        return a.gapScore - b.gapScore;
    });

    return options.slice(0, topN);
}

/**
 * Converts a ScheduleOption to an array of CourseSelection objects
 * that can be used directly with the existing app state.
 */
export function optionToSelections(option: ScheduleOption): CourseSelection[] {
    return option.choices.map(choice => {
        const selection: CourseSelection = {
            course: choice.course
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
