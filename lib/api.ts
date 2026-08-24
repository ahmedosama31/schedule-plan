import { Course, Section, ClassSession } from '../types';
import { COURSES_BY_SEMESTER } from '../data';
import { ACTIVE_SEMESTER_ID } from '../constants';

const API_BASE = '/api';

export type SaveScheduleSource = 'autosave' | 'manual_save';

const sameSession = (a: ClassSession, b: ClassSession) =>
    a.day === b.day &&
    a.startHour === b.startHour &&
    a.endHour === b.endHour &&
    a.location === b.location;

const mergeMultiSessionSections = (courses: Course[]): Course[] => {
    return courses.map(course => {
        const byGroup = new Map<string, Section>();

        for (const section of course.sections) {
            const key = `${section.courseCode}|${section.type}|${section.group}`;
            const existing = byGroup.get(key);

            if (!existing) {
                byGroup.set(key, {
                    ...section,
                    legacyIds: section.legacyIds ? [...section.legacyIds] : [section.id],
                    sessions: [...(section.sessions || [])]
                });
                continue;
            }

            const legacyIds = new Set([...(existing.legacyIds || []), ...(section.legacyIds || []), section.id]);
            existing.legacyIds = Array.from(legacyIds);

            for (const session of section.sessions || []) {
                if (!existing.sessions.some(existingSession => sameSession(existingSession, session))) {
                    existing.sessions.push(session);
                }
            }
        }

        return { ...course, sections: Array.from(byGroup.values()) };
    });
};

export const resolveSectionId = (course: Course, sectionId?: string): string | undefined => {
    if (!sectionId) return undefined;
    const section = course.sections.find(s => s.id === sectionId || s.legacyIds?.includes(sectionId));
    return section?.id || sectionId;
};

export const fetchCourses = async (semesterId = ACTIVE_SEMESTER_ID): Promise<Course[]> => {
    try {
        const response = await fetch(`${API_BASE}/courses?semester_id=${encodeURIComponent(semesterId)}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        return mergeMultiSessionSections(data as Course[]);
    } catch (error) {
        console.warn('API fetch failed, falling back to static data:', error);
        return mergeMultiSessionSections(COURSES_BY_SEMESTER[semesterId] || COURSES_BY_SEMESTER[ACTIVE_SEMESTER_ID]);
    }
};

export const saveSchedule = async (
    studentId: string,
    scheduleJson: string,
    pin?: string,
    scheduleName?: string,
    source: SaveScheduleSource = 'manual_save'
): Promise<{ success: boolean, message?: string, schedule_name?: string, updated_at?: number }> => {
    try {
        const response = await fetch(`${API_BASE}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, schedule_json: scheduleJson, pin, schedule_name: scheduleName, source })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
            return { success: false, message: err.error || response.statusText };
        }
        return await response.json() as { success: boolean, schedule_name?: string, updated_at?: number };
    } catch (e) {
        console.error("Save failed", e);
        return { success: false, message: "Network error" };
    }
}

export type ScheduleResponse =
    | { exists: false }
    | { exists: true, protected: true, schedule_json?: string, schedule_name?: string }
    | { exists: true, protected: false, schedule_json: string, schedule_name?: string };

export interface UserScheduleInfo {
    name: string;
    protected: boolean;
    created_at: number;
    updated_at: number;
}

export const loadSchedule = async (studentId: string, pin?: string, scheduleName?: string): Promise<ScheduleResponse | null> => {
    try {
        const headers: Record<string, string> = {};
        if (pin) headers['X-Auth-Pin'] = pin;

        const nameParam = scheduleName ? `&schedule_name=${encodeURIComponent(scheduleName)}` : '';
        const response = await fetch(`${API_BASE}/schedules?student_id=${studentId}${nameParam}`, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return data as ScheduleResponse;
    } catch (e) {
        console.error("Load failed", e);
        return null;
    }
}

export const fetchUserSchedules = async (studentId: string): Promise<UserScheduleInfo[]> => {
    try {
        const response = await fetch(`${API_BASE}/schedules?student_id=${studentId}&list_all=true`);
        if (!response.ok) return [];
        const data = await response.json() as { schedules: UserScheduleInfo[] };
        return data.schedules;
    } catch (e) {
        console.error("Fetch user schedules failed", e);
        return [];
    }
}

export const deleteSchedule = async (studentId: string, scheduleName?: string): Promise<boolean> => {
    try {
        const nameParam = scheduleName ? `&schedule_name=${encodeURIComponent(scheduleName)}` : '';
        const response = await fetch(`${API_BASE}/schedules?student_id=${studentId}${nameParam}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}

export interface CourseStat {
    code: string;
    count: number;
}

export interface SectionStat {
    name: string;
    count: number;
}

export interface StatsResponse {
    totalSchedules: number;
    courseStats: CourseStat[];
    sectionStats?: SectionStat[];
}

export interface AdminSchedule {
    student_id: string;
    schedule_name?: string;
    schedule_json: string;
    created_at: number;
    updated_at: number;
}

export interface AdminActivityLog {
    id: number;
    student_id: string;
    schedule_name: string;
    action: 'autosave' | 'manual_save' | 'delete';
    status: 'success' | 'failed';
    course_count: number;
    error_message?: string | null;
    created_at: number;
}

export const fetchStats = async (): Promise<StatsResponse | null> => {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) return null;
        return await response.json() as StatsResponse;
    } catch (e) {
        console.error("Stats fetch failed", e);
        return null;
    }
}

export const fetchAllSchedules = async (adminPassword: string): Promise<AdminSchedule[]> => {
    try {
        const response = await fetch(`${API_BASE}/admin/schedules`, {
            headers: {
                'Authorization': `Bearer ${adminPassword}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized");
            throw new Error("Failed to fetch schedules");
        }
        return await response.json() as AdminSchedule[];
    } catch (e) {
        console.error("Fetch all schedules failed", e);
        return [];
    }
}

export const fetchActivityLogs = async (
    adminPassword: string,
    filters: Partial<Pick<AdminActivityLog, 'student_id' | 'schedule_name' | 'action' | 'status'>> & { limit?: number } = {}
): Promise<AdminActivityLog[]> => {
    try {
        const params = new URLSearchParams();
        if (filters.student_id) params.set('student_id', filters.student_id);
        if (filters.schedule_name) params.set('schedule_name', filters.schedule_name);
        if (filters.action) params.set('action', filters.action);
        if (filters.status) params.set('status', filters.status);
        if (filters.limit) params.set('limit', String(filters.limit));

        const query = params.toString();
        const response = await fetch(`${API_BASE}/admin/activity${query ? `?${query}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${adminPassword}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized");
            throw new Error("Failed to fetch activity logs");
        }
        return await response.json() as AdminActivityLog[];
    } catch (e) {
        console.error("Fetch activity logs failed", e);
        return [];
    }
}

export interface CatalogRevision {
    id: number;
    semester_id: string;
    semester_label: string;
    revision: number;
    source_summary?: string | null;
    change_note?: string | null;
    updated_at: number;
}

export const verifyAdminPassword = async (adminPassword: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/admin/auth`, {
            headers: { 'Authorization': `Bearer ${adminPassword}` }
        });
        return response.status === 204;
    } catch (error) {
        console.error("Admin verification failed", error);
        return false;
    }
};

export interface SemesterHistoryResponse {
    active_semester_id: string;
    semesters: Array<{
        semester_id: string;
        semester_label: string;
        latest_revision: number;
        updated_at: number;
    }>;
    revisions?: CatalogRevision[];
}

export const fetchSemesterHistory = async (): Promise<SemesterHistoryResponse | null> => {
    try {
        const response = await fetch(`${API_BASE}/semesters?include_revisions=true`);
        if (!response.ok) return null;
        return await response.json() as SemesterHistoryResponse;
    } catch (error) {
        console.error("Semester history fetch failed", error);
        return null;
    }
};

export interface CatalogUpdateInput {
    semesterId: string;
    semesterLabel: string;
    rawText: string;
    parsedJson: string;
    changeNote?: string;
    sourceSummary?: Record<string, unknown>;
    activate?: boolean;
}

export const updateCourseData = async (input: CatalogUpdateInput, adminPassword: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminPassword}`
            },
            body: JSON.stringify({
                semester_id: input.semesterId,
                semester_label: input.semesterLabel,
                raw_text: input.rawText,
                parsed_json: input.parsedJson,
                change_note: input.changeNote,
                source_summary: input.sourceSummary,
                activate: input.activate ?? true
            })
        });
        return response.ok;
    } catch (e) {
        console.error("Course update failed", e);
        return false;
    }
}
