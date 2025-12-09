
import { CourseSelection, Section, ClassSession, SectionType, Course } from './types';
import { COURSES } from './data';

export interface OptimizationPreferences {
  compactDays: boolean;
  no8am: boolean;
}

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

    const sectionsToCheck: Section[] = getSectionsFromSelection(selection);

    for (const existingSection of sectionsToCheck) {
      for (const existingSession of existingSection.sessions) {
        for (const newSession of newSection.sessions) {
          if (sessionsOverlap(existingSession, newSession)) {
            return `Conflict with ${selection.course.code} (${existingSection.type} Grp ${existingSection.group})`;
          }
        }
      }
    }
  }
  return null;
};

// --- Optimization Helpers ---

// Get all specific Section objects for a fully configured CourseSelection
export const getSectionsFromSelection = (selection: CourseSelection): Section[] => {
  const { course } = selection;
  const sections: Section[] = [];

  if (course.isMTHS && selection.selectedMthsGroup) {
    sections.push(...course.sections.filter(s => s.group === selection.selectedMthsGroup));
  } else {
    if (selection.selectedLectureId) {
      const s = course.sections.find(x => x.id === selection.selectedLectureId);
      if (s) sections.push(s);
    }
    if (selection.selectedTutorialId) {
      const s = course.sections.find(x => x.id === selection.selectedTutorialId);
      if (s) sections.push(s);
    }
    if (selection.selectedLabId) {
      const s = course.sections.find(x => x.id === selection.selectedLabId);
      if (s) sections.push(s);
    }
  }
  return sections;
};

// Generate all possible valid CourseSelection configurations for a given course
const getAllPossibleSelections = (course: Course): CourseSelection[] => {
  const possibilities: CourseSelection[] = [];

  if (course.isMTHS) {
    // For MTHS, we iterate through groups
    const groups = Array.from(new Set(course.sections.map(s => s.group)));
    for (const group of groups) {
      possibilities.push({
        course,
        selectedMthsGroup: group
      });
    }
  } else {
    // For others, we iterate through combinations of Lecture, Tutorial, Lab
    const lecs = course.sections.filter(s => s.type === SectionType.Lecture);
    const tuts = course.sections.filter(s => s.type === SectionType.Tutorial);
    const labs = course.sections.filter(s => s.type === SectionType.Lab);

    // If a type exists for the course, we MUST pick one. If it doesn't exist, we pick "undefined".
    // If a type exists but list is empty (shouldn't happen in valid data), we treat as undefined.
    const lOpts = lecs.length > 0 ? lecs : [undefined];
    const tOpts = tuts.length > 0 ? tuts : [undefined];
    const bOpts = labs.length > 0 ? labs : [undefined];

    for (const l of lOpts) {
      for (const t of tOpts) {
        for (const b of bOpts) {
          possibilities.push({
            course,
            selectedLectureId: l?.id,
            selectedTutorialId: t?.id,
            selectedLabId: b?.id
          });
        }
      }
    }
  }
  return possibilities;
};

// Check if two full selections conflict with each other
const hasConflict = (sel1: CourseSelection, sel2: CourseSelection): boolean => {
  const secs1 = getSectionsFromSelection(sel1);
  const secs2 = getSectionsFromSelection(sel2);

  for (const s1 of secs1) {
    for (const s2 of secs2) {
      for (const sess1 of s1.sessions) {
        for (const sess2 of s2.sessions) {
          if (sessionsOverlap(sess1, sess2)) return true;
        }
      }
    }
  }
  return false;
};

// Calculate a penalty score for a schedule based on preferences (Lower is better)
const calculatePenalty = (selections: CourseSelection[], prefs: OptimizationPreferences): number => {
  let penalty = 0;
  const days = new Set<string>();

  const allSessions: ClassSession[] = [];
  selections.forEach(sel => {
    const secs = getSectionsFromSelection(sel);
    secs.forEach(s => s.sessions.forEach(sess => allSessions.push(sess)));
  });

  allSessions.forEach(sess => {
    days.add(sess.day);
    // 8 AM starts (assuming startHour <= 8.5 counts as '8am block')
    if (prefs.no8am && sess.startHour < 9) { 
       penalty += 1000; 
    }
  });

  if (prefs.compactDays) {
    // heavily penalize each day used
    penalty += days.size * 500; 
  }

  return penalty;
};

export const optimizeSchedule = (
  currentSelections: CourseSelection[],
  prefs: OptimizationPreferences
): CourseSelection[] | null => {
  // If no courses, nothing to optimize
  if (currentSelections.length === 0) return [];

  // 1. Generate all possible options for each selected course
  const courseOptions: CourseSelection[][] = currentSelections.map(s => getAllPossibleSelections(s.course));
  
  // Sort courses by number of options (smallest first) to fail fast in backtracking (heuristic)
  // We need to keep track of original index to return correct set, or just return set of selections
  // Simple backtracking:
  
  let bestSchedule: CourseSelection[] | null = null;
  let minPenalty = Infinity;
  const totalCourses = courseOptions.length;

  const solve = (index: number, currentSchedule: CourseSelection[]) => {
    // Base case: schedule is full
    if (index === totalCourses) {
      const penalty = calculatePenalty(currentSchedule, prefs);
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestSchedule = [...currentSchedule];
      }
      return;
    }

    // Iterate through options for current course
    const options = courseOptions[index];
    
    // Heuristic: Randomized order of options might help find *a* solution faster if we were cutting off,
    // but for finding *best*, we traverse all. 
    // Optimization: if we already exceed minPenalty, prune?
    // Hard to prune effectively without partial penalty calc, but let's try basic pruning.
    
    for (const opt of options) {
      // Check conflict with already picked
      let conflict = false;
      for (const existing of currentSchedule) {
        if (hasConflict(existing, opt)) {
          conflict = true;
          break;
        }
      }
      
      if (!conflict) {
        const newSchedule = [...currentSchedule, opt];
        // Optional: Pruning based on partial penalty if we had a monotonic penalty function
        // (compactDays is monotonic-ish, no8am is monotonic)
        // const partialPenalty = calculatePenalty(newSchedule, prefs);
        // if (partialPenalty >= minPenalty) continue; 
        
        solve(index + 1, newSchedule);
      }
    }
  };

  solve(0, []);

  return bestSchedule;
};
