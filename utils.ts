import { CourseSelection, Section, ClassSession } from './types';
import { COURSES } from './data';

// Helper to check if two sessions overlap
const sessionsOverlap = (s1: ClassSession, s2: ClassSession): boolean => {
  if (s1.day !== s2.day) return false;
  // Overlap logic: Start1 < End2 AND Start2 < End1
  return s1.startHour < s2.endHour && s2.startHour < s1.endHour;
};

// Check if a potential section conflicts with any currently selected section
export const getConflict = (
  newSection: Section,
  currentSelections: CourseSelection[]
): string | null => {
  for (const selection of currentSelections) {
    // Skip if it's the same course (we are replacing the selection, effectively)
    if (selection.course.code === newSection.courseCode) continue;

    const sectionsToCheck: Section[] = [];
    const course = selection.course;

    if (course.isMTHS && selection.selectedMthsGroup) {
        // Add both Lec and Tut for this group
        const groupSections = course.sections.filter(s => s.group === selection.selectedMthsGroup);
        sectionsToCheck.push(...groupSections);
    } else {
        if (selection.selectedLectureId) {
            const s = course.sections.find(sec => sec.id === selection.selectedLectureId);
            if (s) sectionsToCheck.push(s);
        }
        if (selection.selectedTutorialId) {
            const s = course.sections.find(sec => sec.id === selection.selectedTutorialId);
            if (s) sectionsToCheck.push(s);
        }
        if (selection.selectedLabId) {
            const s = course.sections.find(sec => sec.id === selection.selectedLabId);
            if (s) sectionsToCheck.push(s);
        }
    }

    for (const existingSection of sectionsToCheck) {
      for (const existingSession of existingSection.sessions) {
        for (const newSession of newSection.sessions) {
          if (sessionsOverlap(existingSession, newSession)) {
            return `Conflict with ${course.code} (${existingSection.type} Grp ${existingSection.group})`;
          }
        }
      }
    }
  }
  return null;
};
