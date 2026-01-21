import React from 'react';
import { SchedulePreferences, DEFAULT_PREFERENCES } from '../preferences';
import { DayOfWeek } from '../types';
import { Settings, Clock, CalendarX, Zap, ChevronDown, ChevronUp, UserX } from 'lucide-react';

interface Props {
    preferences: SchedulePreferences;
    onChange: (prefs: SchedulePreferences) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const DAYS: DayOfWeek[] = [
    DayOfWeek.Saturday,
    DayOfWeek.Sunday,
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday
];

const TIME_OPTIONS = [
    { value: undefined, label: 'Any' },
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

    const handleSingleSessionToggle = () => {
        onChange({ ...preferences, excludeSingleSessionDays: !preferences.excludeSingleSessionDays });
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
        preferences.excludeSingleSessionDays,
    ].filter(Boolean).length;

    return (
        <div className="border border-[--border-primary] rounded-xl bg-[--bg-tertiary]/50 overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={onToggleExpand}
                className="w-full p-3 flex items-center justify-between hover:bg-[--bg-tertiary] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings size={14} className="text-[--text-muted]" />
                    <span className="text-xs font-semibold text-[--text-secondary]">Optimization Preferences</span>
                    {activeCount > 0 && (
                        <span className="text-[10px] bg-[--text-primary] text-[--bg-primary] px-1.5 py-0.5 rounded-full font-medium">
                            {activeCount} active
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp size={14} className="text-[--text-muted]" />
                ) : (
                    <ChevronDown size={14} className="text-[--text-muted]" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Time Constraints */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-[--text-secondary]">
                            <Clock size={12} />
                            <span>Time Constraints</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-[--text-muted] mb-1">No classes before</label>
                                <select
                                    value={preferences.noClassesBefore ?? ''}
                                    onChange={(e) => handleTimeChange('noClassesBefore', e.target.value)}
                                    className="w-full text-xs p-2 border border-[--border-primary] rounded-lg bg-[--bg-primary] text-[--text-primary] focus:ring-1 focus:ring-[--text-primary]/20 outline-none"
                                >
                                    {TIME_OPTIONS.map(opt => (
                                        <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-[--text-muted] mb-1">No classes after</label>
                                <select
                                    value={preferences.noClassesAfter ?? ''}
                                    onChange={(e) => handleTimeChange('noClassesAfter', e.target.value)}
                                    className="w-full text-xs p-2 border border-[--border-primary] rounded-lg bg-[--bg-primary] text-[--text-primary] focus:ring-1 focus:ring-[--text-primary]/20 outline-none"
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
                        <div className="flex items-center gap-2 text-xs font-medium text-[--text-secondary]">
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
                                        className={`px-2.5 py-1.5 text-[10px] rounded-lg transition-colors font-medium ${isAvoided
                                            ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                                            : 'bg-[--bg-primary] text-[--text-tertiary] border border-[--border-primary] hover:border-[--border-secondary]'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Prefer Consecutive */}
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-[--bg-primary] rounded-xl border border-[--border-primary]">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Zap size={12} className="text-amber-500 flex-shrink-0" />
                            <span className="text-xs text-[--text-secondary]">Prefer consecutive classes</span>
                        </div>
                        <button
                            onClick={handleConsecutiveToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${preferences.preferConsecutive ? 'bg-[--text-primary]' : 'bg-[--border-secondary]'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[--bg-primary] rounded-full shadow transition-transform ${preferences.preferConsecutive ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Exclude Single Session Days */}
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-[--bg-primary] rounded-xl border border-[--border-primary]">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <UserX size={12} className="text-red-500 flex-shrink-0" />
                            <span className="text-xs text-[--text-secondary]">Exclude days with only 1 class</span>
                        </div>
                        <button
                            onClick={handleSingleSessionToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${preferences.excludeSingleSessionDays ? 'bg-[--text-primary]' : 'bg-[--border-secondary]'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[--bg-primary] rounded-full shadow transition-transform ${preferences.excludeSingleSessionDays ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full text-xs text-[--text-muted] hover:text-[--text-primary] py-1.5 transition-colors"
                    >
                        Reset to defaults
                    </button>
                </div>
            )}
        </div>
    );
};

export default PreferencesPanel;
