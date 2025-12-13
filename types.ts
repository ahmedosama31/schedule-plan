export enum DayOfWeek {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
}

export enum SectionType {
  Lecture = 'Lecture',
  Tutorial = 'Tutorial',
  Lab = 'Laboratory',
}

export interface ClassSession {
  day: DayOfWeek;
  startHour: number; // 24-hour format, e.g., 13.5 for 1:30 PM
  endHour: number;
  startString: string; // "13:00"
  endString: string; // "14:30"
}

export interface Section {
  id: string; // Unique ID like "CMPS101-L1"
  courseCode: string;
  type: SectionType;
  group: string; // "1", "2", "A", etc.
  sessions: ClassSession[];
}

export interface Course {
  code: string;
  name: string;
  sections: Section[];
  isMTHS: boolean; // Special flag for Math constraints
}

export interface CourseSelection {
  course: Course;
  selectedLectureId?: string;
  selectedTutorialId?: string;
  selectedLabId?: string;
  // For MTHS, we just track the group number since they are linked
  selectedMthsGroup?: string;
}

export interface CandidateItem {
  id: string; // unique dnd key
  sectionId: string; // actual section id
  courseCode: string;
  type: SectionType;
  day: DayOfWeek;
  start: number;
  end: number;
  label: string;
}
