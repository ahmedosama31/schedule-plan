import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { COURSES } from './data';
import { CourseSelection, SectionType, Section, CandidateItem } from './types';
import CourseCard from './components/CourseCard';
import ScheduleGrid from './components/ScheduleGrid';
import OptimizerModal from './components/OptimizerModal';
import PreferencesPanel from './components/PreferencesPanel';
import ThemeToggle from './components/ThemeToggle';
import { optimizeSchedule, ScheduleOption } from './optimizer';
import { SchedulePreferences, DEFAULT_PREFERENCES } from './preferences';
import { Search, Calendar, PlusCircle, ChevronDown, X, Save, Upload, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [optimizerResults, setOptimizerResults] = useState<ScheduleOption[]>([]);
  const [preferences, setPreferences] = useState<SchedulePreferences>(DEFAULT_PREFERENCES);
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [candidateSections, setCandidateSections] = useState<CandidateItem[]>([]);

  // Configure drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter available courses to add (exclude already selected)
  const availableCourses = useMemo(() => {
    const selectedCodes = new Set(selections.map(s => s.course.code));
    return COURSES.filter(c =>
      !selectedCodes.has(c.code) &&
      (c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selections, searchTerm]);

  const addCourse = (courseCode: string) => {
    const course = COURSES.find(c => c.code === courseCode);
    if (!course) return;
    setSelections([...selections, { course }]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const removeCourse = (courseCode: string) => {
    setSelections(selections.filter(s => s.course.code !== courseCode));
  };

  const updateSelection = (updated: CourseSelection) => {
    setSelections(selections.map(s => s.course.code === updated.course.code ? updated : s));
  };

  const handleSave = () => {
    const dataToSave = selections.map(s => ({
      courseCode: s.course.code,
      selectedLectureId: s.selectedLectureId,
      selectedTutorialId: s.selectedTutorialId,
      selectedLabId: s.selectedLabId,
      selectedMthsGroup: s.selectedMthsGroup
    }));
    localStorage.setItem('spring2026_schedule', JSON.stringify(dataToSave));
    alert('Schedule saved successfully!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('spring2026_schedule');
    if (!saved) {
      alert('No saved schedule found.');
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      const restored: CourseSelection[] = parsed.map((p: any) => {
        const course = COURSES.find(c => c.code === p.courseCode);
        if (!course) return null;
        return {
          course,
          selectedLectureId: p.selectedLectureId,
          selectedTutorialId: p.selectedTutorialId,
          selectedLabId: p.selectedLabId,
          selectedMthsGroup: p.selectedMthsGroup
        };
      }).filter(Boolean);
      setSelections(restored);
      alert('Schedule loaded successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to load schedule. Data may be corrupted.');
    }
  };

  const handleOptimize = () => {
    if (selections.length === 0) {
      alert('Add some courses first before optimizing.');
      return;
    }
    const courses = selections.map(s => s.course);
    const results = optimizeSchedule(courses, 5, preferences);
    if (results.length === 0) {
      alert('No valid schedules found with your current preferences. Try relaxing your constraints.');
      return;
    }
    setOptimizerResults(results);
    setIsOptimizerOpen(true);
  };

  const handleApplyOptimization = (newSelections: CourseSelection[]) => {
    setSelections(newSelections);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    const data = active.data.current;

    // Check if dragging a grid event (RenderItem from ScheduleGrid)
    if (data && data.name && data.type) {
      const course = COURSES.find(c => c.code === data.name);
      if (!course) return;

      const candidates: CandidateItem[] = [];

      if (data.isMTHS) {
        // For MTHS courses, show all groups as candidates
        // Get unique groups from the course sections
        const groups = Array.from(new Set(course.sections.map(s => s.group)));

        groups.forEach(group => {
          // Get all sections (Lecture + Tutorial) for this group
          const groupSections = course.sections.filter(s => s.group === group);

          // Create a candidate for each session in the group
          groupSections.forEach(section => {
            section.sessions.forEach((session, idx) => {
              candidates.push({
                id: `candidate-mths-${group}-${section.type}-${idx}`,
                sectionId: group, // For MTHS, sectionId is the group number
                courseCode: course.code,
                type: section.type,
                day: session.day,
                start: session.startHour,
                end: session.endHour,
                label: `Group ${group} (${section.type === SectionType.Lecture ? 'Lec' : 'Tut'})`
              });
            });
          });
        });
      } else {
        // For regular courses, show sections of the same type
        const sameTypeSections = course.sections.filter(s => s.type === data.type);

        sameTypeSections.forEach(section => {
          section.sessions.forEach((session, idx) => {
            candidates.push({
              id: `candidate-${section.id}-${idx}`,
              sectionId: section.id,
              courseCode: course.code,
              type: section.type,
              day: session.day,
              start: session.startHour,
              end: session.endHour,
              label: `${section.type === SectionType.Lecture ? 'Lec' : section.type === SectionType.Tutorial ? 'Tut' : 'Lab'} ${section.group}`
            });
          });
        });
      }

      setCandidateSections(candidates);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setCandidateSections([]);

    const { over } = event;
    if (!over || !over.data.current) return;

    // Check if dropped on a candidate slot
    if (over.data.current.isCandidate) {
      const candidate = over.data.current as CandidateItem;
      const { courseCode, sectionId, type } = candidate;

      setSelections(prev => prev.map(sel => {
        if (sel.course.code === courseCode) {
          const updated = { ...sel };

          // Check if this is an MTHS course
          if (sel.course.isMTHS) {
            // For MTHS, sectionId is the group number
            updated.selectedMthsGroup = sectionId;
          } else {
            // For regular courses, update the specific section type
            if (type === SectionType.Lecture) updated.selectedLectureId = sectionId;
            else if (type === SectionType.Tutorial) updated.selectedTutorialId = sectionId;
            else if (type === SectionType.Lab) updated.selectedLabId = sectionId;
          }

          return updated;
        }
        return sel;
      }));
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Calendar size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Spring 2026 Scheduler
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleSave}
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              title="Save Schedule"
            >
              <Save size={20} />
            </button>
            <button
              onClick={handleLoad}
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              title="Load Saved Schedule"
            >
              <Upload size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className={`w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-96 absolute h-full z-10'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
              {/* Search */}
              <div ref={searchContainerRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                </div>

                {/* Dropdown */}
                {isDropdownOpen && availableCourses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 max-h-60 overflow-y-auto z-50">
                    {availableCourses.map(course => (
                      <button
                        key={course.code}
                        onClick={() => addCourse(course.code)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 border-b border-slate-100 dark:border-slate-600 last:border-0"
                      >
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{course.code}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{course.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferences */}
              <PreferencesPanel
                preferences={preferences}
                onUpdate={setPreferences}
                isExpanded={isPreferencesExpanded}
                onToggleExpand={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
              />

              {/* Optimize Button */}
              <button
                onClick={handleOptimize}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Optimize Schedule
              </button>
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-4">
              {selections.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <div className="mb-2 flex justify-center">
                    <PlusCircle size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm">Search and add courses to start planning</p>
                </div>
              ) : (
                selections.map(selection => (
                  <CourseCard
                    key={selection.course.code}
                    selection={selection}
                    allSelections={selections}
                    onRemove={() => removeCourse(selection.course.code)}
                    onUpdate={updateSelection}
                  />
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
              Developed for Spring 2026 Registration
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative bg-slate-50 dark:bg-slate-900 p-4 overflow-hidden">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-slate-500 hover:text-blue-600"
              >
                <ChevronDown className="rotate-[-90deg]" size={20} />
              </button>
            )}

            <ScheduleGrid selections={selections} candidateSections={candidateSections} />

            {/* Sidebar Toggle for Desktop */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 hidden lg:block">
              {/* This is just a visual area where sidebar sits */}
            </div>
          </div>
        </div>

        {/* Optimizer Modal */}
        <OptimizerModal
          isOpen={isOptimizerOpen}
          options={optimizerResults}
          onClose={() => setIsOptimizerOpen(false)}
          onApply={handleApplyOptimization}
        />

        {/* Mobile Sidebar Toggle Overlay */}
        {/* Simplified for now */}
      </div>
    </DndContext>
  );
};

export default App;
