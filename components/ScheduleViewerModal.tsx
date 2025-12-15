import React from 'react';
import { X } from 'lucide-react';
import { CourseSelection, DayOfWeek, SectionType } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    scheduleData: CourseSelection[];
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const DAYS = [DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday];

const formatTime = (decimal: number) => {
    let h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const getColorForCourse = (code: string) => {
    const colors = [
        'bg-blue-100 border-blue-500 text-blue-800',
        'bg-emerald-100 border-emerald-500 text-emerald-800',
        'bg-purple-100 border-purple-500 text-purple-800',
        'bg-amber-100 border-amber-500 text-amber-800',
        'bg-rose-100 border-rose-500 text-rose-800',
        'bg-indigo-100 border-indigo-500 text-indigo-800',
    ];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const ScheduleViewerModal: React.FC<Props> = ({ isOpen, onClose, scheduleData }) => {
    if (!isOpen) return null;

    // Flatten schedule data into renderable items
    const items: any[] = [];
    for (const selection of scheduleData) {
        const { course } = selection;
        let sectionsToRender: any[] = [];

        if (course.isMTHS && selection.selectedMthsGroup) {
            sectionsToRender = course.sections.filter(s => s.group === selection.selectedMthsGroup);
        } else {
            if (selection.selectedLectureId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLectureId));
            if (selection.selectedTutorialId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedTutorialId));
            if (selection.selectedLabId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLabId));
        }

        sectionsToRender = sectionsToRender.filter(Boolean);

        for (const section of sectionsToRender) {
            for (const session of section.sessions) {
                items.push({
                    name: course.code,
                    courseName: course.name,
                    type: section.type,
                    day: session.day,
                    start: session.startHour,
                    end: session.endHour,
                    color: getColorForCourse(course.code)
                });
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Schedule Preview</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Schedule Grid */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="p-2 text-xs font-semibold text-slate-400 text-center">Time</div>
                            {DAYS.map(day => (
                                <div key={day} className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center border-l border-slate-200 dark:border-slate-700">
                                    {day.substring(0, 3)}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-[60px_repeat(6,1fr)] relative" style={{ minHeight: '600px' }}>
                            {/* Time labels */}
                            <div className="border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                {HOURS.map(hour => (
                                    <div key={hour} className="h-12 border-b border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 p-1 text-center">
                                        {hour % 12 || 12}{hour >= 12 ? 'PM' : 'AM'}
                                    </div>
                                ))}
                            </div>

                            {/* Day columns */}
                            {DAYS.map(day => (
                                <div key={day} className="relative border-r border-slate-100 dark:border-slate-700 last:border-0">
                                    {/* Grid lines */}
                                    {HOURS.map(hour => (
                                        <div key={hour} className="h-12 border-b border-slate-50 dark:border-slate-700/50"></div>
                                    ))}

                                    {/* Render events */}
                                    {items.filter(item => item.day === day).map((item, idx) => {
                                        const top = (item.start - 8) * 48;
                                        const height = (item.end - item.start) * 48;

                                        return (
                                            <div
                                                key={idx}
                                                className={`absolute rounded p-1 text-[9px] border-l-2 ${item.color}`}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: '2px',
                                                    right: '2px'
                                                }}
                                            >
                                                <div className="font-bold truncate">{item.name}</div>
                                                <div className="opacity-75 truncate">{item.type.substring(0, 3)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleViewerModal;
