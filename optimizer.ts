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

    // Check for empty choices (shouldn't happen, but safety check)
    if (choicesPerCourse.some(choices => choices.length === 0)) {
        return [];
    }

    // Generate all combinations (cartesian product)
    const allCombinations = cartesianProduct(choicesPerCourse);

    // Limit to prevent memory issues with too many combinations
    const MAX_COMBINATIONS = 500000;
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
        // Calculate health score (0-100)
        const healthScore = calculateHealthScore(choices, daysUsed);

        return {
            choices,
            daysUsed,
            dayCount: daysUsed.length,
            gapScore,
            healthScore,
            hasConflicts: conflicts.length > 0,
            conflicts
        };
    });

    // Filter out options with conflicts
    const conflictFreeOptions = options.filter(o => !o.hasConflicts);

    // Sort by:
    // 1. Fewer days is better (primary)
    // 2. Higher Health Score is better (secondary)
    // 3. Lower gap score is better (tertiary - only if preferConsecutive)
    conflictFreeOptions.sort((a, b) => {
        // 1. Day Count
        if (a.dayCount !== b.dayCount) {
            return a.dayCount - b.dayCount;
        }

        // 2. Health Score (Higher is better)
        // Weight the difference to make it significant
        const healthDiff = b.healthScore - a.healthScore;
        if (Math.abs(healthDiff) > 5) { // Only prioritize if difference is significant > 5%
            return healthDiff;
        }

        // 3. Gap Score (Lower is better) - Tiebreaker
        if (preferences.preferConsecutive) {
            return a.gapScore - b.gapScore;
        }

        return 0;
    });

    // Return unique top N results (deterministic)
    return conflictFreeOptions.slice(0, topN);
}

/**
 * Calculates a 'Health Score' (0-100) for a schedule.
 * Considers:
 * - Day balance (variance in day length)
 * - Lunch breaks (finding gaps between 11:00-14:00)
 * - Early starts / Late ends
 * - Excessive gaps
 */
function calculateHealthScore(choices: CourseChoice[], daysUsed: DayOfWeek[]): number {
    let score = 100;
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

    for (const [day, sessions] of sessionsByDay) {
        if (sessions.length === 0) continue;
        sessions.sort((a, b) => a.start - b.start);

        const firstStart = sessions[0].start;
        const lastEnd = sessions[sessions.length - 1].end;
        const duration = lastEnd - firstStart; // Total time explicitly on campus/in-class span

        totalDayDuration += duration;
        dayDurations.push(duration);

        // -- Penalties --

        // Early Start Penalty (before 9:00 AM)
        // ONLY penalize if it's not a short day (ends after 3 PM)
        if (firstStart < 9 && lastEnd > 15) score -= 5;

        // Late End Penalty (after 5:00 PM / 17:00)
        if (lastEnd > 17) score -= 5;

        // Long Day Penalty
        // User guideline: "8am-4pm is okay" (8h). "8am-7pm is horrible" (11h).
        if (duration > 10) {
            score -= 25; // Severe penalty for > 10 hours
        } else if (duration > 9) {
            score -= 10; // Moderate penalty for > 9 hours
        }

        // "Survival" Check: Continuous blocks without breaks
        let maxContinuousBlock = 0;
        let currentBlock = 0;

        for (let i = 0; i < sessions.length; i++) {
            const current = sessions[i];
            const duration = current.end - current.start;

            // Check gap before this session (if not first)
            if (i > 0) {
                const prev = sessions[i - 1];
                const gap = current.start - prev.end;

                if (gap > 0) {
                    // Reset continuous block
                    currentBlock = 0;

                    // Huge Gap Penalty (> 3 hours)
                    if (gap > 3) score -= 8;
                }
            }

            currentBlock += duration;
            maxContinuousBlock = Math.max(maxContinuousBlock, currentBlock);
        }

        // Penalty for grueling continuous blocks (> 4 hours straight)
        if (maxContinuousBlock > 4) score -= 15;
    }

    // Add a small random jitter (0-3%) to "shuffle" results slightly
    // This prevents every student from getting the exact same #1 schedule
    score += Math.floor(Math.random() * 4);

    // 3. Weekly Balance Bonus
    // Standard Deviation of day durations?
    if (dayDurations.length > 1) {
        const mean = totalDayDuration / dayDurations.length;
        const variance = dayDurations.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / dayDurations.length;
        const stdDev = Math.sqrt(variance);

        // If days are very balanced (stdDev < 1 hour), small bonus
        if (stdDev < 1) score += 5;
        // If days are wild (stdDev > 3 hours), penalty
        if (stdDev > 3) score -= 5;
    }

    // 4. Free Day Bonus (already handled by dayCount sort, but nice for score appearance)
    const weekendDays = [DayOfWeek.Saturday, DayOfWeek.Sunday]; // Based on region, usually Fri/Sat are off or Sat/Sun
    // Assuming Standard 5-day week Mon-Fri (or Sun-Thu).
    // Let's just reward keeping dayCount low relative to course load
    // If we have < 5 days, big bonus
    if (daysUsed.length <= 4) score += 15; // Increased from 10
    if (daysUsed.length <= 3) score += 20; // Increased from 15 (Cumulative +35)

    // 5. Total Gap Penalty
    // Penalize total gap time across all days to prefer tighter schedules
    // 2 points per hour of gap
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

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Converts a ScheduleOption to an array of CourseSelection objects
 * that can be used directly with the existing app state.
 */
export function optionToSelections(option: ScheduleOption): CourseSelection[] {
    return option.choices.map(choice => {
        const selection: CourseSelection = {
            course: choice.course,
            // Preserve locks if we had context, but here we just return the selection
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
