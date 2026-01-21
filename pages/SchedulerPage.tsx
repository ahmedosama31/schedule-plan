import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Course, CourseSelection, SectionType, Section, CandidateItem } from '../types';
import CourseCard from '../components/CourseCard';
import ScheduleGrid from '../components/ScheduleGrid';
import OptimizerModal from '../components/OptimizerModal';
import PreferencesPanel from '../components/PreferencesPanel';
import ThemeToggle from '../components/ThemeToggle';
import { optimizeSchedule, ScheduleOption, findConflicts, selectionsToChoices, ConflictInfo } from '../optimizer';
import { SchedulePreferences, DEFAULT_PREFERENCES } from '../preferences';
import { Search, Calendar, PlusCircle, ChevronDown, Save, Zap, Loader, LogOut, FileWarning, Share, X, BookOpen, Grid3x3 } from 'lucide-react';
import { fetchCourses, saveSchedule, loadSchedule, deleteSchedule, ScheduleResponse } from '../lib/api';
import WelcomeModal from '../components/WelcomeModal';
import { getConflict, getConflictAlternatives, ConflictSuggestion } from '../utils';
import PinModal from '../components/PinModal';
import ShareModal from '../components/ShareModal';
import SaveModal from '../components/SaveModal';

const SchedulerPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [sessionPin, setSessionPin] = useState<string | null>(null);
    const [scheduleName, setScheduleName] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMode, setPinMode] = useState<'login' | 'create'>('login');
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [pendingName, setPendingName] = useState<string | null>(null);
    const [selections, setSelections] = useState<CourseSelection[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileTab, setMobileTab] = useState<'courses' | 'schedule'>('courses'); // Mobile-only tab state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
    const [optimizerResults, setOptimizerResults] = useState<ScheduleOption[]>([]);
    const [preferences, setPreferences] = useState<SchedulePreferences>(DEFAULT_PREFERENCES);
    const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [candidateSections, setCandidateSections] = useState<CandidateItem[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false); // Track first-time users for autosave
    const [hasPromptedForPin, setHasPromptedForPin] = useState(false); // Track if we've prompted for PIN this session
    const autosaveChangeCount = useRef(0);

    // Unsaved changes warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

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

    // Helper to parse saved JSON
    const parseScheduleData = (json: string, courseList: Course[]) => {
        try {
            const parsed = JSON.parse(json);
            return parsed.map((p: any) => {
                const course = courseList.find(c => c.code === p.courseCode);
                if (!course) return null;
                return {
                    course,
                    selectedLectureId: p.selectedLectureId,
                    selectedTutorialId: p.selectedTutorialId,
                    selectedLabId: p.selectedLabId,
                    selectedMthsGroup: p.selectedMthsGroup
                };
            }).filter(Boolean);
        } catch (e) {
            return [];
        }
    };

    // Load courses and user data on mount
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const courseData = await fetchCourses();
                setCourses(courseData);

                // Check for shared schedule in URL
                const urlParams = new URLSearchParams(window.location.search);
                const shareData = urlParams.get('share');

                if (shareData) {
                    try {
                        const decoded = JSON.parse(atob(shareData));
                        const sharedSelections = decoded.map((item: any) => {
                            const course = courseData.find(c => c.code === item.c);
                            if (!course) return null;
                            return {
                                course,
                                selectedLectureId: item.l,
                                selectedTutorialId: item.t,
                                selectedLabId: item.b,
                                selectedMthsGroup: item.m
                            };
                        }).filter(Boolean);
                        setSelections(sharedSelections);
                        setShowWelcome(false);
                        // Clear the URL param after loading
                        window.history.replaceState({}, '', window.location.pathname);
                    } catch (e) {
                        console.error('Failed to parse shared schedule', e);
                    }
                    setIsLoading(false);
                    return;
                }

                const cachedId = localStorage.getItem('student_id');
                if (cachedId) {
                    setStudentId(cachedId);
                    // Check status
                    const status = await loadSchedule(cachedId);

                    if (status && status.exists && !status.protected && status.schedule_json) {
                        setSelections(parseScheduleData(status.schedule_json, courseData));
                        setScheduleName(status.schedule_name || null);
                        setShowWelcome(false);
                    } else if (status && status.exists && status.protected) {
                        // Protected: Logged out effectively. Show Welcome.
                        setStudentId(null);
                        setShowWelcome(true);
                    } else {
                        // Not found or network error?
                        if (status && !status.exists) {
                            setSelections([]);
                            setScheduleName(null);
                            setShowWelcome(false);
                        } else {
                            setShowWelcome(true);
                        }
                    }
                } else {
                    setShowWelcome(true);
                }
            } catch (e) {
                console.error("Init error", e);
                setShowWelcome(true);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const handleLogin = async (id: string) => {
        setIsLoading(true);
        const status = await loadSchedule(id);
        setIsLoading(false);

        if (!status) {
            alert("Network error checking ID");
            return;
        }

        // PIN feature DISABLED - log in directly for all users
        // Original PIN check code preserved for future re-activation:
        // if (status.exists && status.protected) {
        //     setPendingId(id);
        //     setPinMode('login');
        //     setShowPinModal(true);
        //     setShowWelcome(false);
        //     return;
        // }

        setStudentId(id);
        localStorage.setItem('student_id', id);
        setShowWelcome(false);
        setSessionPin(null);
        setScheduleName(status.exists ? status.schedule_name || null : null);
        setIsNewUser(!status.exists);

        if (status.exists && status.schedule_json) {
            setSelections(parseScheduleData(status.schedule_json, courses));
        } else {
            setSelections([]);
        }
    };

    const handlePinSubmit = async (pin: string, name?: string) => {
        setShowPinModal(false);

        if (pinMode === 'login' && pendingId) {
            setIsLoading(true);
            const status = await loadSchedule(pendingId, pin);
            setIsLoading(false);

            if (status && status.exists && !status.protected && status.schedule_json) {
                setStudentId(pendingId);
                localStorage.setItem('student_id', pendingId);
                setSessionPin(pin);
                setScheduleName(status.schedule_name || null);
                setSelections(parseScheduleData(status.schedule_json, courses));
                setPendingId(null);
                setPendingName(null);
            } else {
                alert("Incorrect PIN");
                setStudentId(null);
                setShowWelcome(true);
            }
        } else if (pinMode === 'create' && studentId) {
            // Saving (PIN feature disabled, but keeping flow intact)
            await performSave();
        }
    };

    const handleReset = async () => {
        if (!pendingId) return;
        setIsLoading(true);
        const success = await deleteSchedule(pendingId);
        setIsLoading(false);

        setShowPinModal(false);

        if (success) {
            alert("Schedule deleted. You can now create a new one.");
            // Reset to clean slate for this ID
            setStudentId(pendingId);
            localStorage.setItem('student_id', pendingId);
            setSelections([]);
            setSessionPin(null);
            setScheduleName(null);
            setPendingId(null);
            setPendingName(null);
            setShowWelcome(false); // Actually stay logged in as per flow "make a new one"
        } else {
            alert("Failed to delete schedule.");
            setStudentId(null);
            setShowWelcome(true);
        }
    };

    const handleLogout = () => {
        setStudentId(null);
        setSessionPin(null);
        setScheduleName(null);
        localStorage.removeItem('student_id');
        setSelections([]);
        setIsDirty(false);
        setShowWelcome(true);
    };

    // Autosave for ALL users - silently save full schedule data
    // Autosave for ALL users - silently save full schedule data
    useEffect(() => {
        // Autosave for ALL logged-in users with at least one course. Only if dirty.
        if (!studentId || selections.length === 0 || !isDirty) return;

        autosaveChangeCount.current += 1;

        const save = async () => {
            // Save full schedule data including time selections
            const dataToSave = selections.map(s => ({
                courseCode: s.course.code,
                selectedLectureId: s.selectedLectureId,
                selectedTutorialId: s.selectedTutorialId,
                selectedLabId: s.selectedLabId,
                selectedMthsGroup: s.selectedMthsGroup
            }));

            // Save without PIN - single schedule per ID (always 'spring26')
            const result = await saveSchedule(studentId, JSON.stringify(dataToSave), undefined, 'spring26');

            if (result.success) {
                console.log('Autosaved schedule');
                setIsDirty(false);
                autosaveChangeCount.current = 0;
            }
        };

        if (autosaveChangeCount.current >= 5) {
            // Immediate save after 5 changes
            save();
            return;
        } else {
            // Debounce for 600ms
            const timeoutId = setTimeout(save, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [selections, studentId, isDirty]);

    // Detect when schedule is complete (all required sections selected)
    const isScheduleComplete = useMemo(() => {
        if (selections.length === 0) return false;
        return selections.every(sel => {
            const course = sel.course;
            if (course.isMTHS) return !!sel.selectedMthsGroup;

            const hasLectures = course.sections.some(s => s.type === SectionType.Lecture);
            const hasTutorials = course.sections.some(s => s.type === SectionType.Tutorial);
            const hasLabs = course.sections.some(s => s.type === SectionType.Lab);

            return (!hasLectures || !!sel.selectedLectureId) &&
                (!hasTutorials || !!sel.selectedTutorialId) &&
                (!hasLabs || !!sel.selectedLabId);
        });
    }, [selections]);

    // PIN prompt on schedule completion - DISABLED (can be re-enabled later)
    // useEffect(() => {
    //     if (!studentId || !isNewUser || hasPromptedForPin || !isScheduleComplete) return;
    //     setHasPromptedForPin(true);
    //     setPinMode('create');
    //     setShowPinModal(true);
    // }, [isScheduleComplete, studentId, isNewUser, hasPromptedForPin]);

    // Filter available courses to add (exclude already selected)
    const availableCourses = useMemo(() => {
        const selectedCodes = new Set(selections.map(s => s.course.code));
        return courses.filter(c =>
            !selectedCodes.has(c.code) &&
            (c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [selections, searchTerm]);

    const activeConflicts = useMemo(() => {
        if (selections.length === 0) return [];
        const choices = selectionsToChoices(selections);
        return findConflicts(choices);
    }, [selections]);

    const addCourse = (courseCode: string) => {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        setSelections([...selections, { course }]);
        setSearchTerm('');
        setIsDropdownOpen(false);
        setIsDirty(true);
    };

    const removeCourse = (courseCode: string) => {
        setSelections(selections.filter(s => s.course.code !== courseCode));
        setIsDirty(true);
    };

    const updateSelection = (updated: CourseSelection) => {
        setSelections(selections.map(s => s.course.code === updated.course.code ? updated : s));
        setIsDirty(true);
    };

    const performSave = async () => {
        if (!studentId) return;

        const dataToSave = selections.map(s => ({
            courseCode: s.course.code,
            selectedLectureId: s.selectedLectureId,
            selectedTutorialId: s.selectedTutorialId,
            selectedLabId: s.selectedLabId,
            selectedMthsGroup: s.selectedMthsGroup
        }));

        // Single schedule per ID - always use 'spring26', no PIN
        const result = await saveSchedule(studentId, JSON.stringify(dataToSave), undefined, 'spring26');

        if (result.success) {
            setIsDirty(false);
            alert('Schedule saved successfully!');
        } else {
            alert(`Failed to save: ${result.message}`);
        }
    };

    const handleSave = async () => {
        if (!studentId) return;
        // Open save modal for manual saves with custom names
        setIsSaveModalOpen(true);
    };

    const handleManualSave = async (name: string) => {
        if (!studentId) return;

        const dataToSave = selections.map(s => ({
            courseCode: s.course.code,
            selectedLectureId: s.selectedLectureId,
            selectedTutorialId: s.selectedTutorialId,
            selectedLabId: s.selectedLabId,
            selectedMthsGroup: s.selectedMthsGroup
        }));

        const result = await saveSchedule(studentId, JSON.stringify(dataToSave), undefined, name);

        if (result.success) {
            setIsDirty(false);
            setScheduleName(name);
            alert(`Schedule "${name}" saved successfully!`);
        } else {
            alert(`Failed to save: ${result.message}`);
        }
    };

    const handleLoadSchedule = async (name: string) => {
        if (!studentId) return;
        setIsLoading(true);
        const status = await loadSchedule(studentId, undefined, name);
        setIsLoading(false);

        if (status && status.exists && !status.protected && status.schedule_json) {
            setSelections(parseScheduleData(status.schedule_json, courses));
            setScheduleName(name);
            setIsDirty(false);
        } else {
            alert('Failed to load schedule');
        }
    };

    const handleOptimize = () => {
        if (selections.length === 0) {
            alert('Add some courses first before optimizing.');
            return;
        }
        const courses = selections.map(s => s.course);
        const results = optimizeSchedule(courses, 5, preferences, selections);
        if (results.length === 0) {
            // Build detailed error message showing active preferences
            const activePrefs: string[] = [];
            if (preferences.noClassesBefore !== undefined) {
                activePrefs.push(`No classes before ${preferences.noClassesBefore}:00`);
            }
            if (preferences.noClassesAfter !== undefined) {
                activePrefs.push(`No classes after ${preferences.noClassesAfter}:00`);
            }
            if (preferences.avoidDays && preferences.avoidDays.length > 0) {
                const days = preferences.avoidDays.map(d => d.substring(0, 3)).join(', ');
                activePrefs.push(`Avoiding: ${days}`);
            }
            if (preferences.preferConsecutive) {
                activePrefs.push('Preferring consecutive classes');
            }

            let errorMsg = '⚠️ No valid schedules found with your current preferences.';
            if (activePrefs.length > 0) {
                errorMsg += '\n\nActive constraints:\n• ' + activePrefs.join('\n• ');
                errorMsg += '\n\nTry relaxing some of these constraints to find more options.';
            } else {
                errorMsg += '\n\nThis may be due to course section conflicts or limited availability.';
            }

            alert(errorMsg);
            return;
        }
        setOptimizerResults(results);
        setIsOptimizerOpen(true);
    };

    const handleApplyOptimization = (newSelections: CourseSelection[]) => {
        // Preserve lock flags from current selections
        const selectionsWithLocks = newSelections.map(newSel => {
            const oldSel = selections.find(s => s.course.code === newSel.course.code);
            if (oldSel) {
                return {
                    ...newSel,
                    lockedLecture: oldSel.lockedLecture,
                    lockedTutorial: oldSel.lockedTutorial,
                    lockedLab: oldSel.lockedLab,
                    lockedMthsGroup: oldSel.lockedMthsGroup
                };
            }
            return newSel;
        });
        setSelections(selectionsWithLocks);
        setIsOptimizerOpen(false);
        setIsDirty(true);
        // Autosave will handle saving automatically via the useEffect
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragId(String(active.id));
        const data = active.data.current;

        // Check if dragging a grid event (RenderItem from ScheduleGrid)
        if (data && data.name && data.type) {
            const course = courses.find(c => c.code === data.name);
            if (!course) return;

            const candidates: CandidateItem[] = [];

            if (data.isMTHS) {
                // For MTHS courses, show all groups as candidates
                // Get unique groups from the course sections
                const groups = Array.from(new Set<string>(course.sections.map(s => s.group)));

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
            setIsDirty(true);
        }
    };

    // Toggle lock on a specific section for a course
    const handleToggleLock = (courseCode: string, sectionType: SectionType) => {
        setSelections(prev => prev.map(sel => {
            if (sel.course.code === courseCode) {
                const updated = { ...sel };
                if (sel.course.isMTHS) {
                    updated.lockedMthsGroup = !sel.lockedMthsGroup;
                } else {
                    if (sectionType === SectionType.Lecture) updated.lockedLecture = !sel.lockedLecture;
                    else if (sectionType === SectionType.Tutorial) updated.lockedTutorial = !sel.lockedTutorial;
                    else if (sectionType === SectionType.Lab) updated.lockedLab = !sel.lockedLab;
                }
                return updated;
            }
            return sel;
        }));
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                            <Loader className="animate-spin text-blue-600" size={32} />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading courses...</p>
                        </div>
                    </div>
                )}
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Calendar size={24} />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
                            Spring 2026 Scheduler
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {studentId && (
                            <div className="flex items-center gap-2 mr-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ID: {studentId}</span>
                                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-1 rounded-full" title="Logout / Switch ID">
                                    <LogOut size={14} />
                                </button>
                            </div>
                        )}
                        <ThemeToggle />
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                            title="Share Schedule"
                            disabled={selections.length === 0}
                        >
                            <Share size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                            title="Save / Load Schedules"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden relative pb-16 md:pb-0">
                    {/* Sidebar - Show on desktop always, on mobile only when mobileTab === 'courses' */}
                    <div className={`w-full md:w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col relative ${mobileTab === 'courses' ? 'flex' : 'hidden md:flex'}`}>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
                            {/* Mobile header */}
                            <div className="flex md:hidden justify-between items-center mb-2">
                                <h2 className="font-bold text-lg">Course Planning</h2>
                            </div>

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
                                onChange={setPreferences}
                                isExpanded={isPreferencesExpanded}
                                onToggleExpand={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
                            />

                            {/* Conflict Warning */}
                            {activeConflicts.length > 0 && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-2">
                                        <FileWarning size={16} />
                                        <span>{activeConflicts.length} Conflicts Detected</span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {activeConflicts.map((c, i) => {
                                            const suggestions = getConflictAlternatives(c, selections, courses);

                                            const handleApplySuggestion = (suggestion: ConflictSuggestion) => {
                                                setSelections(prev => prev.map(sel => {
                                                    if (sel.course.code === suggestion.courseCode) {
                                                        const updated = { ...sel };
                                                        if (suggestion.action.type === 'mths_group') {
                                                            updated.selectedMthsGroup = suggestion.action.newGroup;
                                                        } else if (suggestion.action.type === 'section') {
                                                            if (suggestion.action.sectionType === SectionType.Lecture) {
                                                                updated.selectedLectureId = suggestion.action.newSectionId;
                                                            } else if (suggestion.action.sectionType === SectionType.Tutorial) {
                                                                updated.selectedTutorialId = suggestion.action.newSectionId;
                                                            } else if (suggestion.action.sectionType === SectionType.Lab) {
                                                                updated.selectedLabId = suggestion.action.newSectionId;
                                                            }
                                                        }
                                                        return updated;
                                                    }
                                                    return sel;
                                                }));
                                                setIsDirty(true);
                                            };

                                            return (
                                                <div key={i} className="flex flex-col gap-1">
                                                    <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold flex items-start gap-1">
                                                        <span>•</span>
                                                        <span>{c.course1} ({c.section1Type}) conflicts with {c.course2} ({c.section2Type}) on {c.day}</span>
                                                    </div>
                                                    {suggestions.length > 0 && (
                                                        <div className="ml-3 pl-2 border-l-2 border-green-400">
                                                            {suggestions.map((s, si) => (
                                                                <button
                                                                    key={si}
                                                                    onClick={() => handleApplySuggestion(s)}
                                                                    className="text-xs text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 cursor-pointer hover:underline block text-left w-full py-0.5"
                                                                >
                                                                    💡 {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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

                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center text-[10px] text-slate-400 dark:text-slate-500 flex flex-col gap-2">
                            <span>Developed by Ahmed Osama</span>
                        </div>
                    </div>

                    {/* Main Schedule Grid - Show on desktop always, on mobile only when mobileTab === 'schedule' */}
                    <div className={`flex-1 relative bg-slate-50 dark:bg-slate-900 p-4 overflow-hidden ${mobileTab === 'schedule' ? 'block' : 'hidden md:block'}`}>
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-slate-500 hover:text-blue-600"
                            >
                                <ChevronDown className="rotate-[-90deg]" size={20} />
                            </button>
                        )}

                        <ScheduleGrid
                            selections={selections}
                            candidateSections={candidateSections}
                            onUpdateSelection={updateSelection}
                            onToggleLock={handleToggleLock}
                        />

                        {/* Sidebar Toggle for Desktop */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 hidden lg:block">
                            {/* This is just a visual area where sidebar sits */}
                        </div>
                    </div>

                    {/* Mobile Bottom Tab Navigation */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 safe-area-bottom">
                        <div className="grid grid-cols-2 h-16">
                            <button
                                onClick={() => setMobileTab('courses')}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors ${mobileTab === 'courses'
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                <BookOpen size={24} />
                                <span className="text-xs font-semibold">Courses</span>
                            </button>
                            <button
                                onClick={() => setMobileTab('schedule')}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors ${mobileTab === 'schedule'
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                <Grid3x3 size={24} />
                                <span className="text-xs font-semibold">Schedule</span>
                            </button>
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

                <WelcomeModal isOpen={showWelcome} onSubmit={handleLogin} />
                <PinModal
                    isOpen={showPinModal}
                    mode={pinMode}
                    scheduleName={pendingName || undefined}
                    onSubmit={handlePinSubmit}
                    onReset={handleReset}
                    onCancel={() => {
                        setShowPinModal(false);
                        if (pinMode === 'login') setShowWelcome(true);
                    }}
                />
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    selections={selections}
                />
                {studentId && (
                    <SaveModal
                        isOpen={isSaveModalOpen}
                        studentId={studentId}
                        currentScheduleName={scheduleName}
                        onSave={handleManualSave}
                        onLoad={handleLoadSchedule}
                        onClose={() => setIsSaveModalOpen(false)}
                    />
                )}
            </div>
        </DndContext>
    );
};

export default SchedulerPage;
