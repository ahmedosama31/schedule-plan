/**
 * Schedule Preferences
 * 
 * User-configurable constraints and preferences for schedule optimization.
 */

import { DayOfWeek } from './types';

/**
 * User preferences for schedule optimization.
 * Hard constraints filter out schedules; soft preferences affect scoring.
 */
export interface SchedulePreferences {
    // Hard constraints (schedules violating these are excluded)
    noClassesBefore?: number;      // e.g., 10 means no classes starting before 10:00
    noClassesAfter?: number;       // e.g., 17 means no classes ending after 17:00
    avoidDays?: DayOfWeek[];       // Days to completely avoid
    excludeSingleSessionDays?: boolean;  // Exclude schedules where any day has only 1 lecture/tutorial

    // Soft preferences (affect scoring but don't exclude)
    preferConsecutive: boolean;    // true = minimize gaps between classes
    maxDaysPerWeek?: number;       // Preferred max days (soft limit)
}

/**
 * Default preferences - no constraints, prefer consecutive classes
 */
export const DEFAULT_PREFERENCES: SchedulePreferences = {
    noClassesBefore: undefined,
    noClassesAfter: undefined,
    avoidDays: [],
    excludeSingleSessionDays: false,
    preferConsecutive: true,
    maxDaysPerWeek: undefined
};
