import React from 'react';
import { SchedulePreferences, DEFAULT_PREFERENCES } from '../preferences';
import { DayOfWeek } from '../types';
import { Settings, Clock, CalendarX, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    preferences: SchedulePreferences;
    onChange: (prefs: SchedulePreferences) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const DAYS: DayOfWeek[] = [
    DayOfWeek.Sunday,
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday
];

const TIME_OPTIONS = [
    { value: undefined, label: 'Any' },
    { value: 8, label: '8:00 AM' },
    { value: 9, label: '9:00 AM' },
    { value: 10, label: '10:00 AM' },
    { value: 11, label: '11:00 AM' },
    { value: 12, label: '12:00 PM' },
    { value: 13, label: '1:00 PM' },
    { value: 14, label: '2:00 PM' },
];

const END_TIME_OPTIONS = [
    { value: undefined, label: 'Any' },
    { value: 14, label: '2:00 PM' },
    { value: 15, label: '3:00 PM' },
    { value: 16, label: '4:00 PM' },
    { value: 17, label: '5:00 PM' },
    { value: 18, label: '6:00 PM' },
    { value: 19, label: '7:00 PM' },
];

const PreferencesPanel: React.FC<Props> = ({ preferences, onChange, isExpanded, onToggleExpand }) => {
    const handleTimeChange = (field: 'noClassesBefore' | 'noClassesAfter', value: string) => {
        onChange({
            ...preferences,
            [field]: value === '' ? undefined : parseInt(value)
        });
    };

    const handleDayToggle = (day: DayOfWeek) => {
        const currentAvoid = preferences.avoidDays || [];
        const newAvoid = currentAvoid.includes(day)
            ? currentAvoid.filter(d => d !== day)
            : [...currentAvoid, day];
        onChange({ ...preferences, avoidDays: newAvoid });
    };

    const handleConsecutiveToggle = () => {
        onChange({ ...preferences, preferConsecutive: !preferences.preferConsecutive });
    };

    const handleReset = () => {
        onChange({ ...DEFAULT_PREFERENCES });
    };

    // Count active preferences
    const activeCount = [
        preferences.noClassesBefore !== undefined,
        preferences.noClassesAfter !== undefined,
        (preferences.avoidDays?.length || 0) > 0,
        preferences.preferConsecutive,
    ].filter(Boolean).length;

    return (
        <div className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
            {/* Header - Always visible */}
            <button
                onClick={onToggleExpand}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Optimization Preferences</span>
                    {activeCount > 0 && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                            {activeCount} active
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp size={14} className="text-slate-400" />
                ) : (
                    <ChevronDown size={14} className="text-slate-400" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Time Constraints */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <Clock size={12} />
                            <span>Time Constraints</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">No classes before</label>
                                <select
                                    value={preferences.noClassesBefore ?? ''}
                                    onChange={(e) => handleTimeChange('noClassesBefore', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                >
                                    {TIME_OPTIONS.map(opt => (
                                        <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">No classes after</label>
                                <select
                                    value={preferences.noClassesAfter ?? ''}
                                    onChange={(e) => handleTimeChange('noClassesAfter', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                >
                                    {END_TIME_OPTIONS.map(opt => (
                                        <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Avoid Days */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <CalendarX size={12} />
                            <span>Avoid Days</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {DAYS.map(day => {
                                const isAvoided = preferences.avoidDays?.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        className={`px-2 py-1 text-[10px] rounded transition-colors ${isAvoided
                                            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                            : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Prefer Consecutive */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Zap size={12} className="text-amber-500 flex-shrink-0" />
                            <span className="text-xs text-slate-600 dark:text-slate-300">Prefer consecutive classes</span>
                        </div>
                        <button
                            onClick={handleConsecutiveToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${preferences.preferConsecutive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${preferences.preferConsecutive ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 py-1"
                    >
                        Reset to defaults
                    </button>
                </div>
            )}
        </div>
    );
};

export default PreferencesPanel;
