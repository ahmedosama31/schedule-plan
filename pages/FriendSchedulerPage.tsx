import React, { useEffect, useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader, Plus, Save, Search, Users, Zap } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import FriendResultsModal from '../components/FriendResultsModal';
import FriendSaveModal, { FriendSaveScope } from '../components/FriendSaveModal';
import PreferencesPanel from '../components/PreferencesPanel';
import ScheduleGrid from '../components/ScheduleGrid';
import ThemeToggle from '../components/ThemeToggle';
import { DEFAULT_PREFERENCES, SchedulePreferences } from '../preferences';
import { Course, CourseSelection, SectionType } from '../types';
import { DEFAULT_SCHEDULE_NAME, TERM_LABEL } from '../constants';
import {
    fetchCourses,
    fetchUserSchedulesResult,
    loadSchedule,
    resolveSectionId,
    saveSchedule,
    saveMatchedSchedules,
    UserScheduleInfo,
} from '../lib/api';
import { FriendOptimizationMode, FriendOptimizationResult, FriendScheduleOption } from '../friendOptimizer';
import { runFriendOptimizer } from '../lib/friendOptimizerWorker';
import { optionToSelections } from '../optimizer';

interface StudentDraft {
    id: string;
    loaded: boolean;
    isNew: boolean;
    sourceScheduleName: string | null;
    savedSchedules: UserScheduleInfo[];
    selections: CourseSelection[];
    preferences: SchedulePreferences;
    preferencesExpanded: boolean;
    error: string | null;
}

const emptyDraft = (): StudentDraft => ({
    id: '',
    loaded: false,
    isNew: false,
    sourceScheduleName: null,
    savedSchedules: [],
    selections: [],
    preferences: { ...DEFAULT_PREFERENCES, avoidDays: [] },
    preferencesExpanded: false,
    error: null,
});

const parseSchedule = (json: string, courses: Course[]): CourseSelection[] => {
    try {
        const parsed = JSON.parse(json) as Array<Record<string, unknown>>;
        if (!Array.isArray(parsed)) return [];
        return parsed.map((item): CourseSelection | null => {
            const course = courses.find(candidate => candidate.code === item.courseCode);
            if (!course) return null;
            return {
                course,
                selectedLectureId: resolveSectionId(course, item.selectedLectureId as string | undefined),
                selectedTutorialId: resolveSectionId(course, item.selectedTutorialId as string | undefined),
                selectedLabId: resolveSectionId(course, item.selectedLabId as string | undefined),
                selectedMthsGroup: item.selectedMthsGroup as string | undefined,
                lockedLecture: Boolean(item.lockedLecture),
                lockedTutorial: Boolean(item.lockedTutorial),
                lockedLab: Boolean(item.lockedLab),
                lockedMthsGroup: Boolean(item.lockedMthsGroup),
            };
        }).filter((selection): selection is CourseSelection => Boolean(selection));
    } catch {
        return [];
    }
};

const serializeSchedule = (selections: CourseSelection[]) => JSON.stringify(selections.map(selection => ({
    courseCode: selection.course.code,
    selectedLectureId: selection.selectedLectureId,
    selectedTutorialId: selection.selectedTutorialId,
    selectedLabId: selection.selectedLabId,
    selectedMthsGroup: selection.selectedMthsGroup,
    lockedLecture: selection.lockedLecture,
    lockedTutorial: selection.lockedTutorial,
    lockedLab: selection.lockedLab,
    lockedMthsGroup: selection.lockedMthsGroup,
})));

const preserveLocks = (next: CourseSelection[], current: CourseSelection[]) => next.map(selection => {
    const previous = current.find(item => item.course.code === selection.course.code);
    return previous ? {
        ...selection,
        lockedLecture: previous.lockedLecture,
        lockedTutorial: previous.lockedTutorial,
        lockedLab: previous.lockedLab,
        lockedMthsGroup: previous.lockedMthsGroup,
    } : selection;
});

const unusedMatchedName = (otherId: string, schedules: UserScheduleInfo[]) => {
    const base = `${DEFAULT_SCHEDULE_NAME}-match-${otherId}`;
    const existing = new Set(schedules.map(schedule => schedule.name));
    if (!existing.has(base)) return base;
    let suffix = 2;
    while (existing.has(`${base}-${suffix}`)) suffix++;
    return `${base}-${suffix}`;
};

const FriendSchedulerPage: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [drafts, setDrafts] = useState<[StudentDraft, StudentDraft]>([emptyDraft(), emptyDraft()]);
    const [idInputs, setIdInputs] = useState<[string, string]>(['', '']);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [mode, setMode] = useState<FriendOptimizationMode>('maximum-matches');
    const [result, setResult] = useState<FriendOptimizationResult | null>(null);
    const [dirtyStudents, setDirtyStudents] = useState<[boolean, boolean]>([false, false]);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [targetNames, setTargetNames] = useState<[string, string]>(['', '']);
    const [courseSearches, setCourseSearches] = useState<[string, string]>(['', '']);
    const [courseSearchOpen, setCourseSearchOpen] = useState<[boolean, boolean]>([false, false]);
    const isDirty = dirtyStudents.some(Boolean);

    useEffect(() => {
        fetchCourses().then(setCourses).finally(() => setIsLoadingCourses(false));
    }, []);

    useEffect(() => {
        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [isDirty]);

    const updateDraft = (index: number, updater: (draft: StudentDraft) => StudentDraft, dirty = true) => {
        setDrafts(previous => {
            const next: [StudentDraft, StudentDraft] = [...previous];
            next[index] = updater(previous[index]);
            return next;
        });
        if (dirty) setDirtyStudents(previous => {
            const next: [boolean, boolean] = [...previous];
            next[index] = true;
            return next;
        });
    };

    const loadStudent = async (id: string): Promise<StudentDraft> => {
        const listResult = await fetchUserSchedulesResult(id);
        if (!listResult.success) throw new Error(`Could not retrieve schedules for ${id}. Check your connection and try again.`);
        if (listResult.schedules.length === 0) {
            const defaultStatus = await loadSchedule(id, undefined, DEFAULT_SCHEDULE_NAME);
            if (!defaultStatus) throw new Error(`Could not check whether ${id} has a saved schedule.`);
            if (!defaultStatus.exists) return { ...emptyDraft(), id, loaded: true, isNew: true };
        }

        const preferred = listResult.schedules.find(schedule => schedule.name === DEFAULT_SCHEDULE_NAME) || listResult.schedules[0];
        if (!preferred) return { ...emptyDraft(), id, loaded: true, isNew: true };
        const status = await loadSchedule(id, undefined, preferred.name);
        if (!status) throw new Error(`Could not load ${preferred.name} for ${id}.`);
        if (!status.exists) throw new Error(`The selected schedule for ${id} no longer exists.`);
        if (status.protected || !status.schedule_json) throw new Error(`The selected schedule for ${id} is protected.`);
        return {
            ...emptyDraft(),
            id,
            loaded: true,
            sourceScheduleName: preferred.name,
            savedSchedules: listResult.schedules,
            selections: parseSchedule(status.schedule_json, courses),
        };
    };

    const handleLoadBoth = async () => {
        const ids: [string, string] = [idInputs[0].trim(), idInputs[1].trim()];
        if (!ids[0] || !ids[1]) return;
        if (ids[0] === ids[1]) {
            alert('Enter two different student IDs.');
            return;
        }
        if (isDirty && !confirm('Discard the unsaved friend schedule drafts?')) return;
        setIsLoadingStudents(true);
        setResult(null);
        try {
            const settled = await Promise.allSettled([loadStudent(ids[0]), loadStudent(ids[1])]);
            const next = settled.map((entry, index) => entry.status === 'fulfilled'
                ? entry.value
                : { ...emptyDraft(), id: ids[index], error: entry.reason instanceof Error ? entry.reason.message : String(entry.reason) }) as [StudentDraft, StudentDraft];
            setDrafts(next);
            setTargetNames([
                unusedMatchedName(ids[1], next[0].savedSchedules),
                unusedMatchedName(ids[0], next[1].savedSchedules),
            ]);
            setDirtyStudents([false, false]);
            setCourseSearches(['', '']);
            setCourseSearchOpen([false, false]);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const handleScheduleChange = async (index: number, name: string) => {
        if (dirtyStudents[index] && !confirm(`Discard unsaved changes for Student ${index + 1} and load this schedule?`)) return;
        updateDraft(index, draft => ({ ...draft, error: null }), false);
        const status = await loadSchedule(drafts[index].id, undefined, name);
        if (!status) {
            updateDraft(index, draft => ({ ...draft, error: 'Network error loading that schedule.' }), false);
            return;
        }
        if (!status.exists || status.protected || !status.schedule_json) {
            updateDraft(index, draft => ({ ...draft, error: 'That schedule is unavailable or protected.' }), false);
            return;
        }
        updateDraft(index, draft => ({
            ...draft,
            sourceScheduleName: name,
            selections: parseSchedule(status.schedule_json, courses),
        }), false);
        setTargetNames(previous => {
            const next: [string, string] = [...previous];
            next[index] = unusedMatchedName(drafts[index === 0 ? 1 : 0].id, drafts[index].savedSchedules);
            return next;
        });
        setResult(null);
        setDirtyStudents(previous => {
            const next: [boolean, boolean] = [...previous];
            next[index] = false;
            return next;
        });
    };

    const addCourse = (index: number, code: string) => {
        const course = courses.find(item => item.code === code);
        if (!course || drafts[index].selections.some(selection => selection.course.code === code)) return;
        updateDraft(index, draft => ({ ...draft, selections: [...draft.selections, { course }] }));
        setCourseSearches(previous => {
            const next: [string, string] = [...previous];
            next[index] = '';
            return next;
        });
        setCourseSearchOpen(previous => {
            const next: [boolean, boolean] = [...previous];
            next[index] = false;
            return next;
        });
        setResult(null);
    };

    const toggleLock = (index: number, courseCode: string, type: SectionType) => {
        updateDraft(index, draft => ({
            ...draft,
            selections: draft.selections.map(selection => {
                if (selection.course.code !== courseCode) return selection;
                if (selection.course.isMTHS) return { ...selection, lockedMthsGroup: !selection.lockedMthsGroup };
                if (type === SectionType.Lecture) return { ...selection, lockedLecture: !selection.lockedLecture };
                if (type === SectionType.Tutorial) return { ...selection, lockedTutorial: !selection.lockedTutorial };
                return { ...selection, lockedLab: !selection.lockedLab };
            }),
        }));
    };

    const handleOptimize = async () => {
        if (drafts.some(draft => !draft.loaded || draft.selections.length === 0)) {
            alert('Load both students and select at least one course for each.');
            return;
        }
        setIsOptimizing(true);
        try {
            const nextResult = await runFriendOptimizer(
                { selections: drafts[0].selections, preferences: drafts[0].preferences },
                { selections: drafts[1].selections, preferences: drafts[1].preferences },
                mode,
                5,
            );
            setResult(nextResult);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Friend optimization failed.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleApply = (option: FriendScheduleOption) => {
        setDrafts(previous => [
            { ...previous[0], selections: preserveLocks(optionToSelections(option.student1), previous[0].selections) },
            { ...previous[1], selections: preserveLocks(optionToSelections(option.student2), previous[1].selections) },
        ]);
        setResult(null);
        setDirtyStudents([true, true]);
    };

    const handleSave = async (names: [string, string], scope: FriendSaveScope) => {
        setIsSaving(true);
        setSaveError(null);
        const savedIndices = scope === 'both' ? [0, 1] : [scope === 'student-1' ? 0 : 1];
        let savedTimestamps: Array<number | null> = [null, null];
        let error: string | undefined;

        if (scope === 'both') {
            const response = await saveMatchedSchedules([
                {
                    student_id: drafts[0].id,
                    source_schedule_name: drafts[0].sourceScheduleName,
                    target_schedule_name: names[0],
                    schedule_json: serializeSchedule(drafts[0].selections),
                },
                {
                    student_id: drafts[1].id,
                    source_schedule_name: drafts[1].sourceScheduleName,
                    target_schedule_name: names[1],
                    schedule_json: serializeSchedule(drafts[1].selections),
                },
            ]);
            if (!response.success) error = response.error || 'Failed to save both schedules.';
            else savedTimestamps = response.schedules?.map(schedule => schedule.updated_at) || savedTimestamps;
        } else {
            const index = savedIndices[0];
            const response = await saveSchedule(
                drafts[index].id,
                serializeSchedule(drafts[index].selections),
                undefined,
                names[index],
                'manual_save',
            );
            if (!response.success) error = response.message || `Failed to save Student ${index + 1}.`;
            else savedTimestamps[index] = response.updated_at || null;
        }
        setIsSaving(false);
        if (error) {
            setSaveError(error);
            return;
        }
        const now = Math.floor(Date.now() / 1000);
        setDrafts(previous => previous.map((draft, index) => ({
            ...draft,
            savedSchedules: savedIndices.includes(index) ? [
                { name: names[index], protected: false, created_at: now, updated_at: savedTimestamps[index] || now },
                ...draft.savedSchedules.filter(schedule => schedule.name !== names[index]),
            ] : draft.savedSchedules,
        })) as [StudentDraft, StudentDraft]);
        setTargetNames(names);
        setDirtyStudents(previous => previous.map((dirty, index) => savedIndices.includes(index) ? false : dirty) as [boolean, boolean]);
        setIsSaveOpen(false);
    };

    const canUseWorkspace = drafts.every(draft => draft.loaded);
    const canSaveStudents = drafts.map((draft, index) => draft.loaded && draft.selections.length > 0 && dirtyStudents[index]) as [boolean, boolean];
    const canSave = canUseWorkspace && canSaveStudents.some(Boolean);
    const canSaveBoth = canUseWorkspace && drafts.every(draft => draft.selections.length > 0) && dirtyStudents.some(Boolean);
    const availableCourses = useMemo(() => drafts.map(draft => {
        const selected = new Set(draft.selections.map(selection => selection.course.code));
        return courses.filter(course => !selected.has(course.code));
    }) as [Course[], Course[]], [courses, drafts]);
    const filteredAvailableCourses = useMemo(() => availableCourses.map((studentCourses, index) => {
        const term = courseSearches[index].trim().toLowerCase();
        if (!term) return studentCourses;
        return studentCourses.filter(course => course.code.toLowerCase().includes(term) || course.name.toLowerCase().includes(term));
    }) as [Course[], Course[]], [availableCourses, courseSearches]);
    const commonCourseCodes = useMemo(() => {
        const student2Codes = new Set(drafts[1].selections.map(selection => selection.course.code));
        return new Set(drafts[0].selections.map(selection => selection.course.code).filter(code => student2Codes.has(code)));
    }, [drafts]);

    const leave = () => {
        if (!isDirty || confirm('Leave and discard unsaved friend schedule changes?')) navigate('/');
    };

    return (
        <DndContext>
            <div className="min-h-screen bg-[--bg-secondary] text-[--text-primary]">
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[--border-primary] bg-[--bg-primary] px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <button onClick={leave} className="rounded-lg p-2 text-[--text-tertiary] hover:bg-[--bg-tertiary]" title="Back to my schedule"><ArrowLeft size={18} /></button>
                        <div className="rounded-md bg-[--text-primary] p-1.5 text-[--bg-primary]"><Users size={19} /></div>
                        <div><h1 className="text-sm font-bold md:text-base">Plan with a Friend</h1><p className="hidden text-[10px] text-[--text-muted] sm:block">{TERM_LABEL}</p></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <button disabled={!canSave} onClick={() => setIsSaveOpen(true)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[--bg-tertiary] disabled:opacity-40"><Save size={17} /><span className="hidden sm:inline">Save</span></button>
                    </div>
                </header>

                <main className="mx-auto max-w-[1600px] space-y-5 p-4 md:p-6">
                    <section className="rounded-2xl border border-[--border-primary] bg-[--bg-primary] p-4 shadow-sm">
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            {[0, 1].map(index => (
                                <label key={index} className="text-sm font-medium text-[--text-secondary]">
                                    Student ID {index + 1}
                                    <input value={idInputs[index]} onChange={event => setIdInputs(previous => {
                                        const next: [string, string] = [...previous];
                                        next[index] = event.target.value;
                                        return next;
                                    })} placeholder={index === 0 ? 'Your ID' : 'Friend’s ID'} className="mt-2 w-full rounded-xl border border-[--border-primary] bg-[--bg-tertiary] px-3 py-2.5 text-[--text-primary] outline-none focus:border-[--text-secondary]" />
                                </label>
                            ))}
                            <button disabled={isLoadingStudents || isLoadingCourses || !idInputs[0].trim() || !idInputs[1].trim()} onClick={handleLoadBoth} className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[--text-primary] px-5 font-semibold text-[--bg-primary] disabled:opacity-40">
                                {isLoadingStudents ? <Loader className="animate-spin" size={17} /> : <Users size={17} />}Load or start
                            </button>
                        </div>
                    </section>

                    {drafts.some(draft => draft.error) && (
                        <div className="grid gap-3 md:grid-cols-2">{drafts.map((draft, index) => draft.error && <div key={index} className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">Student {index + 1}: {draft.error}</div>)}</div>
                    )}

                    {canUseWorkspace && (
                        <>
                            <section className="grid gap-4 xl:grid-cols-2">
                                {drafts.map((draft, index) => (
                                    <article key={draft.id} className="overflow-hidden rounded-2xl border border-[--border-primary] bg-[--bg-primary] shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--border-primary] p-4">
                                            <div><h2 className="font-bold">Student {index + 1} · {draft.id}</h2><p className="text-xs text-[--text-muted]">{draft.isNew ? 'New local draft' : 'Loaded saved schedule'}</p></div>
                                            {draft.savedSchedules.length > 0 && <select value={draft.sourceScheduleName || ''} onChange={event => handleScheduleChange(index, event.target.value)} className="rounded-lg border border-[--border-primary] bg-[--bg-tertiary] px-3 py-2 text-xs">
                                                {draft.savedSchedules.map(schedule => <option key={schedule.name} value={schedule.name}>{schedule.name}</option>)}
                                            </select>}
                                        </div>
                                        <div className="space-y-4 p-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 text-[--text-muted]" size={16} />
                                                <input
                                                    type="text"
                                                    aria-label={`Search courses for Student ${index + 1}`}
                                                    placeholder="Search courses to add…"
                                                    value={courseSearches[index]}
                                                    onChange={event => {
                                                        setCourseSearches(previous => {
                                                            const next: [string, string] = [...previous];
                                                            next[index] = event.target.value;
                                                            return next;
                                                        });
                                                        setCourseSearchOpen(previous => {
                                                            const next: [boolean, boolean] = [...previous];
                                                            next[index] = true;
                                                            return next;
                                                        });
                                                    }}
                                                    onFocus={() => setCourseSearchOpen(previous => {
                                                        const next: [boolean, boolean] = [...previous];
                                                        next[index] = true;
                                                        return next;
                                                    })}
                                                    onBlur={() => window.setTimeout(() => setCourseSearchOpen(previous => {
                                                        const next: [boolean, boolean] = [...previous];
                                                        next[index] = false;
                                                        return next;
                                                    }), 120)}
                                                    className="w-full rounded-xl border border-[--border-primary] bg-[--bg-tertiary] py-2.5 pl-9 pr-3 text-sm text-[--text-primary] outline-none focus:border-[--text-secondary] focus:ring-2 focus:ring-[--text-primary]/10"
                                                />
                                                {courseSearchOpen[index] && (
                                                    <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-[--border-primary] bg-[--bg-primary] shadow-xl">
                                                        {filteredAvailableCourses[index].length === 0 ? (
                                                            <div className="px-4 py-5 text-center text-xs text-[--text-muted]">No matching courses</div>
                                                        ) : filteredAvailableCourses[index].slice(0, 8).map(course => (
                                                            <button
                                                                key={course.code}
                                                                type="button"
                                                                onMouseDown={event => event.preventDefault()}
                                                                onClick={() => addCourse(index, course.code)}
                                                                className="w-full border-b border-[--border-primary] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[--bg-tertiary]"
                                                            >
                                                                <div className="text-sm font-semibold text-[--text-primary]">{course.code}</div>
                                                                <div className="truncate text-xs text-[--text-tertiary]">{course.name}</div>
                                                            </button>
                                                        ))}
                                                        {filteredAvailableCourses[index].length > 8 && <div className="border-t border-[--border-primary] px-4 py-2 text-center text-xs text-[--text-muted]">+{filteredAvailableCourses[index].length - 8} more results</div>}
                                                    </div>
                                                )}
                                            </div>
                                            <PreferencesPanel preferences={draft.preferences} onChange={preferences => updateDraft(index, current => ({ ...current, preferences }))} isExpanded={draft.preferencesExpanded} onToggleExpand={() => updateDraft(index, current => ({ ...current, preferencesExpanded: !current.preferencesExpanded }), false)} />
                                            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                                                {draft.selections.length === 0 ? <div className="py-10 text-center text-sm text-[--text-muted]"><Plus className="mx-auto mb-2 opacity-40" />Select courses for this student</div> : draft.selections.map(selection => {
                                                    const isCommon = commonCourseCodes.has(selection.course.code);
                                                    return (
                                                        <div key={selection.course.code} className={isCommon ? 'rounded-2xl border-2 border-emerald-400 bg-emerald-50/70 p-1.5 dark:border-emerald-700 dark:bg-emerald-950/20' : ''}>
                                                            {isCommon && <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"><Users size={13} />Course selected by both students</div>}
                                                            <CourseCard selection={selection} allSelections={draft.selections} onRemove={() => updateDraft(index, current => ({ ...current, selections: current.selections.filter(item => item.course.code !== selection.course.code) }))} onUpdate={updated => updateDraft(index, current => ({ ...current, selections: current.selections.map(item => item.course.code === updated.course.code ? updated : item) }))} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <section className="rounded-2xl border border-[--border-primary] bg-[--bg-primary] p-4 shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div><h2 className="font-bold">Optimize together</h2><p className="text-xs text-[--text-muted]">Only common lectures and tutorials count as matches.</p></div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <div className="flex rounded-xl bg-[--bg-tertiary] p-1 text-xs font-semibold">
                                            <button onClick={() => setMode('maximum-matches')} className={`rounded-lg px-3 py-2 ${mode === 'maximum-matches' ? 'bg-[--bg-primary] shadow-sm' : 'text-[--text-muted]'}`}>Maximum matches</button>
                                            <button onClick={() => setMode('balanced')} className={`rounded-lg px-3 py-2 ${mode === 'balanced' ? 'bg-[--bg-primary] shadow-sm' : 'text-[--text-muted]'}`}>Balanced 50/50</button>
                                        </div>
                                        <button disabled={isOptimizing || drafts.some(draft => draft.selections.length === 0)} onClick={handleOptimize} className="flex items-center justify-center gap-2 rounded-xl bg-[--text-primary] px-5 py-2.5 text-sm font-semibold text-[--bg-primary] disabled:opacity-40">
                                            {isOptimizing ? <Loader className="animate-spin" size={17} /> : <Zap size={17} />}{isOptimizing ? 'Finding pairs…' : 'Optimize Together'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-8">
                                {drafts.map((draft, index) => (
                                    <div key={draft.id} className="h-[620px] min-w-0">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Calendar size={16} />Student {index + 1} preview</div>
                                        <ScheduleGrid selections={draft.selections} onUpdateSelection={updated => updateDraft(index, current => ({ ...current, selections: current.selections.map(item => item.course.code === updated.course.code ? updated : item) }))} onToggleLock={(courseCode, type) => toggleLock(index, courseCode, type)} />
                                    </div>
                                ))}
                            </section>
                        </>
                    )}
                </main>

                <FriendResultsModal result={result} onApply={handleApply} onClose={() => setResult(null)} />
                <FriendSaveModal isOpen={isSaveOpen} studentIds={[drafts[0].id, drafts[1].id]} initialNames={targetNames} sourceNames={[drafts[0].sourceScheduleName, drafts[1].sourceScheduleName]} existingNames={[drafts[0].savedSchedules.map(schedule => schedule.name), drafts[1].savedSchedules.map(schedule => schedule.name)]} canSaveStudents={canSaveStudents} canSaveBoth={canSaveBoth} isSaving={isSaving} error={saveError} onSave={handleSave} onClose={() => setIsSaveOpen(false)} />
            </div>
        </DndContext>
    );
};

export default FriendSchedulerPage;
