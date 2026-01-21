import React from 'react';
import { ScheduleOption, optionToSelections } from '../optimizer';
import { CourseSelection, DayOfWeek } from '../types';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface Props {
    isOpen: boolean;
    options: ScheduleOption[];
    onClose: () => void;
    onApply: (selections: CourseSelection[]) => void;
}

const OptimizerModal: React.FC<Props> = ({ isOpen, options, onClose, onApply }) => {
    if (!isOpen) return null;

    const handleApply = (option: ScheduleOption) => {
        const selections = optionToSelections(option);
        onApply(selections);
        onClose();
    };

    // Format days list nicely
    const formatDays = (days: DayOfWeek[]) => {
        return days.map(d => d.substring(0, 3)).join(', ');
    };

    // Format gap score as hours and minutes
    const formatGap = (gapScore: number) => {
        if (gapScore === 0) return 'No gaps';
        const hours = Math.floor(gapScore);
        const mins = Math.round((gapScore - hours) * 60);
        if (hours === 0) return `${mins}m gaps`;
        if (mins === 0) return `${hours}h gaps`;
        return `${hours}h ${mins}m gaps`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-[--border-primary]">
                {/* Header */}
                <div className="p-5 border-b border-[--border-primary] flex justify-between items-center bg-[--text-primary] text-[--bg-primary]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[--bg-primary]/20 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Schedule Optimizer</h2>
                            <p className="text-xs text-[--bg-primary]/70">Top {options.length} schedule{options.length !== 1 ? 's' : ''} found</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[--bg-primary]/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {options.length === 0 ? (
                        <div className="text-center py-12 text-[--text-muted]">
                            <Calendar size={48} className="mx-auto mb-4 opacity-40" />
                            <p className="font-medium">No schedule combinations found</p>
                            <p className="text-sm mt-1">Add more courses to optimize</p>
                        </div>
                    ) : (
                        options.map((option, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl border transition-all bg-[--bg-primary] hover:shadow-md group overflow-hidden ${option.hasConflicts ? 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20' : 'border-[--border-primary] hover:border-[--border-secondary]'}`}
                            >
                                <div className="flex items-center justify-between p-5 gap-4 flex-wrap">
                                    <div className="flex items-center gap-6 flex-wrap">
                                        {/* Quality Score */}
                                        <div className="flex flex-col gap-2 min-w-[180px]">
                                            <div className="flex flex-wrap gap-1.5">
                                                {option.flags && option.flags.length > 0 ? (
                                                    option.flags.map((flag, fIdx) => (
                                                        <span
                                                            key={fIdx}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[--bg-tertiary] text-[--text-secondary] border border-[--border-primary]"
                                                        >
                                                            {flag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-[--text-muted] italic">Standard Schedule</span>
                                                )}
                                            </div>
                                            {idx === 0 && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle size={12} />
                                                    <span>Top Recommendation</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-1.5 border-l border-[--border-primary] pl-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-[--text-muted]" />
                                                <span className="text-sm font-medium text-[--text-primary]">
                                                    {option.dayCount} Days
                                                    <span className="text-[--text-muted] font-normal ml-1">({formatDays(option.daysUsed)})</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-[--text-muted]" />
                                                <span className="text-sm font-medium text-[--text-primary]">
                                                    {formatGap(option.gapScore)}
                                                </span>
                                            </div>
                                            {option.hasConflicts && (
                                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                    <AlertTriangle size={16} />
                                                    <span className="text-sm font-medium">
                                                        {option.conflicts.length} Conflicts
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() => handleApply(option)}
                                        className="px-5 py-2.5 bg-[--text-primary] hover:opacity-90 text-[--bg-primary] text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                    >
                                        Apply Schedule
                                    </button>
                                </div>

                                {/* Conflict Details (only if present) */}
                                {option.hasConflicts && (
                                    <div className="bg-red-50 dark:bg-red-950/30 px-5 py-3 border-t border-red-200 dark:border-red-900">
                                        <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                            {option.conflicts.slice(0, 2).map((conflict, cIdx) => (
                                                <div key={cIdx} className="flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    <span>
                                                        Conflict: {conflict.course1} & {conflict.course2} ({conflict.day.substring(0, 3)} {conflict.time})
                                                    </span>
                                                </div>
                                            ))}
                                            {option.conflicts.length > 2 && (
                                                <div className="pl-4">+{option.conflicts.length - 2} more...</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
};

export default OptimizerModal;
