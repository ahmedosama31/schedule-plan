import { Course } from '../types';
import { COURSES as STATIC_COURSES } from '../data'; // Fallback to static data

const API_BASE = '/api';

export const fetchCourses = async (): Promise<Course[]> => {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        return data as Course[]; // Assuming the API returns the parsed Course[] directly
    } catch (error) {
        console.warn('API fetch failed, falling back to static data:', error);
        return STATIC_COURSES;
    }
};

export const saveSchedule = async (studentId: string, scheduleJson: string, pin?: string, scheduleName?: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, schedule_json: scheduleJson, pin, schedule_name: scheduleName })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
            return { success: false, message: err.error || response.statusText };
        }
        return { success: true };
    } catch (e) {
        console.error("Save failed", e);
        return { success: false, message: "Network error" };
    }
}

export type ScheduleResponse =
    | { exists: false }
    | { exists: true, protected: true, schedule_json?: string, schedule_name?: string }
    | { exists: true, protected: false, schedule_json: string, schedule_name?: string };

export const loadSchedule = async (studentId: string, pin?: string): Promise<ScheduleResponse | null> => {
    try {
        const headers: Record<string, string> = {};
        if (pin) headers['X-Auth-Pin'] = pin;

        const response = await fetch(`${API_BASE}/schedules?student_id=${studentId}`, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return data as ScheduleResponse;
    } catch (e) {
        console.error("Load failed", e);
        return null;
    }
}


export const deleteSchedule = async (studentId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/schedules?student_id=${studentId}`, {
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

export const updateCourseData = async (rawText: string, parsedJson: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_text: rawText, parsed_json: parsedJson })
        });
        return response.ok;
    } catch (e) {
        console.error("Course update failed", e);
        return false;
    }
}
