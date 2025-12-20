import React from 'react';
import { ScheduleOption, optionToSelections } from '../optimizer';
import { CourseSelection, DayOfWeek } from '../types';
import { X, Calendar, Clock, AlertTriangle, CheckCircle, Zap, Heart } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Schedule Optimizer</h2>
                            <p className="text-xs text-blue-100">Top {options.length} schedule{options.length !== 1 ? 's' : ''} found</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {options.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No schedule combinations found</p>
                            <p className="text-sm mt-1">Add more courses to optimize</p>
                        </div>
                    ) : (
                        options.map((option, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl border hover:border-blue-400 transition-all bg-white hover:shadow-lg group overflow-hidden ${option.hasConflicts ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}
                            >
                                <div className="flex items-center justify-between p-5">
                                    <div className="flex items-center gap-6">
                                        {/* Quality Score */}
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <div className="flex flex-wrap gap-1.5">
                                                {option.flags && option.flags.length > 0 ? (
                                                    option.flags.map((flag, fIdx) => (
                                                        <span
                                                            key={fIdx}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                                                        >
                                                            {flag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Standard Schedule</span>
                                                )}
                                            </div>
                                            {idx === 0 && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <CheckCircle size={12} />
                                                    <span>Top Recommendation</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-1.5 border-l border-slate-100 pl-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {option.dayCount} Days
                                                    <span className="text-slate-400 font-normal ml-1">({formatDays(option.daysUsed)})</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formatGap(option.gapScore)}
                                                </span>
                                            </div>
                                            {option.hasConflicts && (
                                                <div className="flex items-center gap-2 text-red-600">
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
                                        className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Apply Schedule
                                    </button>
                                </div>

                                {/* Conflict Details (only if present) - kept minimal */}
                                {option.hasConflicts && (
                                    <div className="bg-red-50/50 px-5 py-3 border-t border-red-100">
                                        <div className="text-xs text-red-600 space-y-1">
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
