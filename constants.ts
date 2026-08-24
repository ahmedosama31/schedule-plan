export interface SemesterDefinition {
  id: string;
  label: string;
  defaultScheduleName: string;
}

export const SEMESTERS: SemesterDefinition[] = [
  { id: 'fall-2026-27', label: 'Fall 2026/27', defaultScheduleName: 'fall26-27' },
  { id: 'summer-2026', label: 'Summer 2026', defaultScheduleName: 'summer26' },
];

export const ACTIVE_SEMESTER_ID = 'fall-2026-27';
export const ACTIVE_SEMESTER = SEMESTERS.find(semester => semester.id === ACTIVE_SEMESTER_ID)!;
export const DEFAULT_SCHEDULE_NAME = ACTIVE_SEMESTER.defaultScheduleName;
export const TERM_LABEL = ACTIVE_SEMESTER.label;
export const APP_TITLE = `${TERM_LABEL} Scheduler`;
