import React, { useState, useEffect } from 'react';
import { BarChart, Upload, Lock, RefreshCw, ArrowLeft, Users, FileText, Database, ChevronRight, Clock, Search, Eye, X } from 'lucide-react';
import { fetchStats, fetchAllSchedules, updateCourseData, StatsResponse, AdminSchedule } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { parseRawCourseData } from '../lib/parser';
import ScheduleViewerModal from '../components/ScheduleViewerModal';
import { CourseSelection } from '../types';
import { COURSES } from '../data';

type Tab = 'overview' | 'schedules' | 'data' | 'compare';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Data Management Props
    const [rawText, setRawText] = useState('');

    // Admin Features
    const [showAllCourses, setShowAllCourses] = useState(false);
    const [showAllSections, setShowAllSections] = useState(false);
    const [selectedSectionStudents, setSelectedSectionStudents] = useState<string[] | null>(null);
    const [selectedScheduleData, setSelectedScheduleData] = useState<CourseSelection[] | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Comparison feature
    const [compareId1, setCompareId1] = useState('');
    const [compareId2, setCompareId2] = useState('');
    const [comparisonResult, setComparisonResult] = useState<any>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '12345678') {
            setIsAuthenticated(true);
            loadStats();
        } else {
            alert('Incorrect password');
        }
    };

    const loadStats = async () => {
        setIsLoading(true);
        const data = await fetchStats();
        if (data) setStats(data);
        setIsLoading(false);
    };

    const loadSchedules = async () => {
        setIsLoading(true);
        const data = await fetchAllSchedules(password);
        setSchedules(data);
        setIsLoading(false);
    };

    // Effect to load data when tab changes
    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'overview') loadStats();
            if (activeTab === 'schedules') loadSchedules();
        }
    }, [activeTab, isAuthenticated]);

    const handleUpdateCourses = async () => {
        if (!rawText) return;

        let parsedJson = '';
        let rawContent = rawText;

        // Auto-detect format
        if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
            try {
                JSON.parse(rawText);
                parsedJson = rawText;
            } catch (e) {
                alert("Invalid JSON format.");
                return;
            }
        } else {
            try {
                const courses = parseRawCourseData(rawText);
                if (courses.length === 0) {
                    alert("Could not parse raw text. Check format.");
                    return;
                }
                parsedJson = JSON.stringify(courses);
                alert(`Parsed ${courses.length} courses from raw text.`);
            } catch (e) {
                console.error(e);
                alert(`Error parsing raw text: ${e}`);
                return;
            }
        }

        setIsLoading(true);
        const success = await updateCourseData(rawContent, parsedJson);
        setIsLoading(false);

        if (success) {
            alert("Courses updated successfully!");
            setRawText('');
        } else {
            alert("Failed to update courses.");
        }
    };

    // Get students enrolled in a specific section
    const getStudentsForSection = (sectionName: string): string[] => {
        const studentIds: string[] = [];
        for (const schedule of schedules) {
            try {
                const parsed = JSON.parse(schedule.schedule_json);
                for (const item of parsed) {
                    // Check if this matches the section name
                    const matches =
                        (item.selectedLectureId && `${item.courseCode} Lecture ${item.selectedLectureId}` === sectionName) ||
                        (item.selectedTutorialId && `${item.courseCode} Tutorial ${item.selectedTutorialId}` === sectionName) ||
                        (item.selectedLabId && `${item.courseCode} Lab ${item.selectedLabId}` === sectionName) ||
                        (item.selectedMthsGroup && `${item.courseCode} Group ${item.selectedMthsGroup}` === sectionName);

                    if (matches) {
                        studentIds.push(schedule.student_id);
                        break;
                    }
                }
            } catch (e) {
                // Skip invalid schedules
            }
        }
        return studentIds;
    };

    // Parse schedule JSON into CourseSelection[]
    const parseScheduleForViewer = (scheduleJson: string): CourseSelection[] | null => {
        try {
            const parsed = JSON.parse(scheduleJson);
            return parsed.map((item: any) => {
                const course = COURSES.find(c => c.code === item.courseCode);
                if (!course) return null;
                return {
                    course,
                    selectedLectureId: item.selectedLectureId,
                    selectedTutorialId: item.selectedTutorialId,
                    selectedLabId: item.selectedLabId,
                    selectedMthsGroup: item.selectedMthsGroup
                };
            }).filter(Boolean);
        } catch (e) {
            return null;
        }
    };

    // Filter schedules based on search term
    const filteredSchedules = schedules.filter(s => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();

        // Search by student ID
        if (s.student_id.toLowerCase().includes(lowerSearch)) return true;

        // Search by schedule name
        if (s.schedule_name?.toLowerCase().includes(lowerSearch)) return true;

        // Search by course code in schedule
        try {
            const parsed = JSON.parse(s.schedule_json);
            return parsed.some((item: any) => item.courseCode?.toLowerCase().includes(lowerSearch));
        } catch (e) {
            return false;
        }
    });

    const coursesToShow = showAllCourses ? stats?.courseStats : stats?.courseStats.slice(0, 5);
    const sectionsToShow = showAllSections ? stats?.sectionStats : stats?.sectionStats?.slice(0, 10);

    // Compare schedules function
    const handleCompare = () => {
        const schedule1 = schedules.find(s => s.student_id === compareId1);
        const schedule2 = schedules.find(s => s.student_id === compareId2);

        if (!schedule1 || !schedule2) {
            alert('One or both student IDs not found');
            return;
        }

        try {
            const parsed1 = JSON.parse(schedule1.schedule_json);
            const parsed2 = JSON.parse(schedule2.schedule_json);

            // Find common sections
            const commonSections: any[] = [];

            for (const item1 of parsed1) {
                for (const item2 of parsed2) {
                    if (item1.courseCode === item2.courseCode) {
                        // Check lecture
                        if (item1.selectedLectureId && item1.selectedLectureId === item2.selectedLectureId) {
                            const course = COURSES.find(c => c.code === item1.courseCode);
                            const section = course?.sections.find(s => s.id === item1.selectedLectureId);
                            if (section) {
                                commonSections.push({
                                    course: item1.courseCode,
                                    type: 'Lecture',
                                    group: section.group,
                                    times: section.sessions.map(s => `${s.day.substring(0, 3)} ${s.startString}-${s.endString}`).join(', ')
                                });
                            }
                        }
                        // Check tutorial
                        if (item1.selectedTutorialId && item1.selectedTutorialId === item2.selectedTutorialId) {
                            const course = COURSES.find(c => c.code === item1.courseCode);
                            const section = course?.sections.find(s => s.id === item1.selectedTutorialId);
                            if (section) {
                                commonSections.push({
                                    course: item1.courseCode,
                                    type: 'Tutorial',
                                    group: section.group,
                                    times: section.sessions.map(s => `${s.day.substring(0, 3)} ${s.startString}-${s.endString}`).join(', ')
                                });
                            }
                        }
                        // Check MTHS groups
                        if (item1.selectedMthsGroup && item1.selectedMthsGroup === item2.selectedMthsGroup) {
                            const course = COURSES.find(c => c.code === item1.courseCode);
                            if (course) {
                                const groupSections = course.sections.filter(s => s.group === item1.selectedMthsGroup);
                                commonSections.push({
                                    course: item1.courseCode,
                                    type: `MTHS Group ${item1.selectedMthsGroup}`,
                                    group: item1.selectedMthsGroup,
                                    times: groupSections.map(s =>
                                        `${s.type}: ${s.sessions[0]?.day.substring(0, 3)} ${s.sessions[0]?.startString}`
                                    ).join(', ')
                                });
                            }
                        }
                    }
                }
            }

            setComparisonResult({
                id1: compareId1,
                id2: compareId2,
                commonSections
            });
        } catch (e) {
            alert('Error parsing schedules');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Lock size={32} className="text-slate-500" />
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Back to Planner
                    </button>
                </div>

                {!isAuthenticated ? (
                    <div className="max-w-md mx-auto py-12 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                        <form onSubmit={handleLogin} className="flex flex-col items-center justify-center space-y-6">
                            <h3 className="text-xl font-medium">Please Log In</h3>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full text-center border p-3 rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter Admin Password"
                                autoFocus
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                                Login to Dashboard
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Navigation Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <BarChart size={20} /> Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('schedules')}
                                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'schedules' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Users size={20} /> Schedules
                            </button>
                            <button
                                onClick={() => setActiveTab('data')}
                                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'data' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Database size={20} /> Course Data
                            </button>
                            <button
                                onClick={() => setActiveTab('compare')}
                                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'compare' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <Users size={20} /> Compare
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 min-h-[60vh]">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">System Overview</h2>
                                        <button onClick={loadStats} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
                                        </button>
                                    </div>

                                    {stats ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* KPI Card */}
                                            <div className="col-span-1 lg:col-span-1 p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                                                <div className="flex items-center gap-3 mb-2 opacity-90">
                                                    <FileText size={20} />
                                                    <span className="font-bold uppercase tracking-wide text-xs">Total Schedules Saved</span>
                                                </div>
                                                <div className="text-5xl font-black">{stats.totalSchedules}</div>
                                            </div>

                                            {/* Course Stats */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        <ChevronRight size={20} className="text-blue-500" />
                                                        Top Courses
                                                    </h3>
                                                    {stats.courseStats.length > 5 && (
                                                        <button
                                                            onClick={() => setShowAllCourses(!showAllCourses)}
                                                            className="text-xs text-blue-600 hover:underline font-medium"
                                                        >
                                                            {showAllCourses ? 'Show Top 5' : `Show All (${stats.courseStats.length})`}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`overflow-x-auto ${showAllCourses ? 'max-h-96 overflow-y-auto' : ''}`}>
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase text-xs sticky top-0">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left rounded-l-lg">Rank</th>
                                                                <th className="px-4 py-2 text-left">Code</th>
                                                                <th className="px-4 py-2 text-right rounded-r-lg">Selections</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                            {coursesToShow?.map((s, i) => (
                                                                <tr key={s.code}>
                                                                    <td className="px-4 py-3 font-mono text-slate-400">#{i + 1}</td>
                                                                    <td className="px-4 py-3 font-bold">{s.code}</td>
                                                                    <td className="px-4 py-3 text-right font-medium">{s.count}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Section Stats - Full Width */}
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                                        <ChevronRight size={20} className="text-green-500" />
                                                        Detailed Section Popularity
                                                    </h3>
                                                    {stats.sectionStats && stats.sectionStats.length > 10 && (
                                                        <button
                                                            onClick={() => setShowAllSections(!showAllSections)}
                                                            className="text-xs text-blue-600 hover:underline font-medium"
                                                        >
                                                            {showAllSections ? 'Show Top 10' : `Show All (${stats.sectionStats.length})`}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={`${showAllSections ? 'max-h-96' : 'max-h-96'} overflow-y-auto`}>
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase text-xs sticky top-0">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left">Rank</th>
                                                                <th className="px-4 py-2 text-left">Section Name</th>
                                                                <th className="px-4 py-2 text-right">Students</th>
                                                                <th className="px-4 py-2 text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                            {sectionsToShow?.map((s, i) => (
                                                                <tr key={s.name} className="hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                                                    <td className="px-4 py-2 font-mono text-slate-400">#{i + 1}</td>
                                                                    <td className="px-4 py-2 font-medium">{s.name}</td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-bold">
                                                                            {s.count}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <button
                                                                            onClick={() => {
                                                                                const students = getStudentsForSection(s.name);
                                                                                setSelectedSectionStudents(students);
                                                                            }}
                                                                            className="text-xs bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 px-2 py-1 rounded text-emerald-800 dark:text-emerald-200 font-medium"
                                                                        >
                                                                            View IDs
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {(!stats.sectionStats || stats.sectionStats.length === 0) && (
                                                                <tr>
                                                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No granular data available yet.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-slate-400">Loading stats...</div>
                                    )}
                                </div>
                            )}

                            {/* SCHEDULES TAB */}
                            {activeTab === 'schedules' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Student Schedules</h2>
                                        <button onClick={loadSchedules} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh List
                                        </button>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by Student ID, Schedule Name, or Course Code..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-3 font-bold">Student ID</th>
                                                    <th className="px-6 py-3 font-bold">Schedule Name</th>
                                                    <th className="px-6 py-3 font-bold">Last Updated</th>
                                                    <th className="px-6 py-3 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                                                {filteredSchedules.map((schedule) => (
                                                    <tr key={schedule.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                        <td className="px-6 py-4 font-mono font-medium">{schedule.student_id}</td>
                                                        <td className="px-6 py-4">{schedule.schedule_name || <span className="text-slate-400 italic">Untitled</span>}</td>
                                                        <td className="px-6 py-4 text-slate-500 block">
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {schedule.updated_at ? new Date(schedule.updated_at * 1000).toLocaleString() : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    const parsed = parseScheduleForViewer(schedule.schedule_json);
                                                                    if (parsed) {
                                                                        setSelectedScheduleData(parsed);
                                                                    } else {
                                                                        alert('Invalid schedule data');
                                                                    }
                                                                }}
                                                                className="text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-1.5 rounded text-blue-800 dark:text-blue-200 font-medium flex items-center gap-1 inline-flex"
                                                            >
                                                                <Eye size={12} />
                                                                View Schedule
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredSchedules.length === 0 && !isLoading && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                            {searchTerm ? `No schedules match "${searchTerm}"` : 'No schedules found in the database.'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* DATA TAB */}
                            {activeTab === 'data' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Course Data Management</h2>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                                            <FileText size={16} className="mt-0.5 shrink-0" />
                                            <span>
                                                <strong>Input Format:</strong> System accepts standard JSON <code>{`[{"code": "..."}]`}</code> OR
                                                Tab-Separated Raw Text (copy-pasted from Excel/Legacy system).
                                            </span>
                                        </p>
                                    </div>

                                    <textarea
                                        value={rawText}
                                        onChange={e => setRawText(e.target.value)}
                                        className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                        placeholder={`Paste JSON or Raw Tab-Separated Text here...\n\nExample Raw:\n1\t__GENS209__\tLife Skills\t1\tLecture_\tSunday\t9:00_\t10:50___\n...`}
                                    ></textarea>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleUpdateCourses}
                                            disabled={!rawText || isLoading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                        >
                                            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                                            Process & Update Database
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* COMPARE TAB */}
                            {activeTab === 'compare' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold">Compare Schedules</h2>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <strong>Find Common Classes:</strong> Enter two student IDs to see which lectures and tutorials they share together.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Student ID 1</label>
                                            <input
                                                type="text"
                                                value={compareId1}
                                                onChange={(e) => setCompareId1(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Enter first student ID"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Student ID 2</label>
                                            <input
                                                type="text"
                                                value={compareId2}
                                                onChange={(e) => setCompareId2(e.target.value)}
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Enter second student ID"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCompare}
                                        disabled={!compareId1 || !compareId2}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        <Users size={20} />
                                        Compare Schedules
                                    </button>

                                    {comparisonResult && (
                                        <div className="mt-6 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-6">
                                            <h3 className="text-lg font-bold mb-4">
                                                Common Sections: {comparisonResult.id1} & {comparisonResult.id2}
                                            </h3>
                                            {comparisonResult.commonSections.length === 0 ? (
                                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                                                    No common sections found
                                                </p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left">Course</th>
                                                                <th className="px-4 py-3 text-left">Type</th>
                                                                <th className="px-4 py-3 text-left">Group</th>
                                                                <th className="px-4 py-3 text-left">Times</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                            {comparisonResult.commonSections.map((section: any, idx: number) => (
                                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                                    <td className="px-4 py-3 font-bold">{section.course}</td>
                                                                    <td className="px-4 py-3">{section.type}</td>
                                                                    <td className="px-4 py-3">{section.group}</td>
                                                                    <td className="px-4 py-3 text-sm">{section.times}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* Student IDs Modal */}
            {
                selectedSectionStudents && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold">Enrolled Students ({selectedSectionStudents.length})</h3>
                                <button
                                    onClick={() => setSelectedSectionStudents(null)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {selectedSectionStudents.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No students enrolled</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedSectionStudents.map((id, idx) => (
                                            <div key={idx} className="px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg font-mono text-sm">
                                                {id}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Schedule Viewer Modal */}
            {
                selectedScheduleData && (
                    <ScheduleViewerModal
                        isOpen={true}
                        onClose={() => setSelectedScheduleData(null)}
                        scheduleData={selectedScheduleData}
                    />
                )
            }
        </div >
    );
};

export default AdminPage;
