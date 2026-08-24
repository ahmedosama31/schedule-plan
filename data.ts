import { Course } from './types';
import { ACTIVE_SEMESTER_ID, SEMESTERS } from './constants';
import fall202627 from './data/semesters/fall-2026-27.json';
import summer2026 from './data/semesters/summer-2026.json';

export interface SemesterCatalog {
  id: string;
  label: string;
  courses: Course[];
}

export const SEMESTER_CATALOGS: SemesterCatalog[] = [
  {
    id: SEMESTERS[0].id,
    label: SEMESTERS[0].label,
    courses: fall202627 as Course[],
  },
  {
    id: SEMESTERS[1].id,
    label: SEMESTERS[1].label,
    courses: summer2026 as Course[],
  },
];

export const COURSES_BY_SEMESTER = Object.fromEntries(
  SEMESTER_CATALOGS.map(semester => [semester.id, semester.courses]),
) as Record<string, Course[]>;

export const COURSES: Course[] = COURSES_BY_SEMESTER[ACTIVE_SEMESTER_ID];
