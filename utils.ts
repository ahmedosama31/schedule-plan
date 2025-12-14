
import { CourseSelection, Section, ClassSession, Course, SectionType } from './types';

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
    // Skip same course - switching sections within a course should always be allowed
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

export interface ConflictSuggestion {
  label: string;
  courseCode: string;
  action: {
    type: 'mths_group' | 'section';
    newGroup?: string;
    sectionType?: SectionType;
    newSectionId?: string;
  };
}

// Helper to suggest alternatives for conflicts
export const getConflictAlternatives = (
  conflict: {
    course1: string;
    course2: string;
    section1Type: string;
    section2Type: string;
    day: string;
    time: string;
  },
  selections: CourseSelection[],
  allCourses: Course[]
): ConflictSuggestion[] => {
  const suggestions: ConflictSuggestion[] = [];

  // Find the actual course objects involved
  const c1Selection = selections.find(s => s.course.code === conflict.course1);
  const c1Raw = allCourses.find(c => c.code === conflict.course1);

  if (!c1Selection || !c1Raw) return suggestions;

  // We'll try to find alternatives for Course 1
  // Determine which section type is conflicting based on string (Lecture/Tutorial/Lab)
  let typeToCheck: SectionType | null = null;
  if (conflict.section1Type === 'Lecture') typeToCheck = SectionType.Lecture;
  else if (conflict.section1Type === 'Tutorial') typeToCheck = SectionType.Tutorial;
  else if (conflict.section1Type === 'Lab') typeToCheck = SectionType.Lab;

  if (!typeToCheck && !c1Raw.isMTHS) return suggestions;

  // For MTHS, we check other groups
  if (c1Raw.isMTHS) {
    const currentGroup = c1Selection.selectedMthsGroup;
    // Get all unique groups
    const groups = Array.from(new Set<string>(c1Raw.sections.map(s => s.group)));

    for (const group of groups) {
      if (group === currentGroup) continue;

      // Build a hypothetical selection with this new group
      const hypotheticalSelection: CourseSelection = {
        ...c1Selection,
        selectedMthsGroup: group
      };

      // Create list of OTHER selections (excluding current c1)
      const otherSelections = selections.filter(s => s.course.code !== conflict.course1);

      // Check if this new group conflicts with anything in otherSelections
      // We use getConflict which checks a SECTION against selections.
      // MTHS has multiple sections per group (Lec + Tut). We need to check both.
      const groupSections = c1Raw.sections.filter(s => s.group === group);
      let valid = true;

      for (const section of groupSections) {
        if (getConflict(section, otherSelections)) {
          valid = false;
          break;
        }
      }

      if (valid) {
        // Find time string for this group (just take first session of first section for brevity)
        const timeStr = groupSections[0]?.sessions[0]
          ? `${groupSections[0].sessions[0].day} ${groupSections[0].sessions[0].startString}`
          : 'another time';
        suggestions.push({
          label: `Switch ${conflict.course1} to Group ${group} (${timeStr})`,
          courseCode: conflict.course1,
          action: {
            type: 'mths_group',
            newGroup: group
          }
        });
        if (suggestions.length >= 2) return suggestions; // Limit suggestions
      }
    }
  } else if (typeToCheck) {
    // Regular course - find other sections of this type
    const alternatives = c1Raw.sections.filter(s => s.type === typeToCheck);

    for (const altSection of alternatives) {
      // Skip if it's the one currently selected (hard to know exact ID from conflict string, but we can check ID if we had it. 
      // Simplified: just check if it conflicts with others. If it's the current one, it WILL conflict with the other conflicting course.
      // So if getConflict returns null, it's a valid move (and thus different from current state).

      const otherSelections = selections.filter(s => s.course.code !== conflict.course1);

      // CRITICAL: We also need to check "internal" conflict if we swap? 
      // Actually getConflict checks against current selections. 
      // If we swap Lec, we need to make sure the NEW Lec doesn't conflict with our OWN Tut/Lab?
      // The current getConflict implementation checks against "currentSelections".
      // If we pass otherSelections (which has our own Tut/Lab), it will verify that too.
      // So yes, passing otherSelections is correct.

      if (!getConflict(altSection, otherSelections)) {
        const timeStr = altSection.sessions[0]
          ? `${altSection.sessions[0].day} ${altSection.sessions[0].startString}`
          : 'another time';
        suggestions.push({
          label: `Switch ${conflict.course1} ${conflict.section1Type} to ${altSection.group} (${timeStr})`,
          courseCode: conflict.course1,
          action: {
            type: 'section',
            sectionType: typeToCheck,
            newSectionId: altSection.id
          }
        });
        if (suggestions.length >= 2) break;
      }
    }
  }

  return suggestions;
};
