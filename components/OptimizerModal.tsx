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
                                className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${option.hasConflicts
                                    ? 'border-red-200 bg-red-50/50'
                                    : 'border-slate-200 bg-white hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">

                                        {/* Stats */}
                                        <div className="flex flex-wrap gap-4 mb-3">
                                            {/* Days */}
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-blue-500" />
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {option.dayCount} day{option.dayCount !== 1 ? 's' : ''}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    ({formatDays(option.daysUsed)})
                                                </span>
                                            </div>

                                            {/* Gap */}
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-amber-500" />
                                                <span className="text-sm text-slate-600">
                                                    {formatGap(option.gapScore)}
                                                </span>
                                            </div>

                                            {/* Conflict status */}
                                            <div className="flex items-center gap-2">
                                                {option.hasConflicts ? (
                                                    <>
                                                        <AlertTriangle size={16} className="text-red-500" />
                                                        <span className="text-sm text-red-600 font-medium">
                                                            {option.conflicts.length} conflict{option.conflicts.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} className="text-emerald-500" />
                                                        <span className="text-sm text-emerald-600 font-medium">
                                                            No conflicts
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Conflict details */}
                                        {option.hasConflicts && (
                                            <div className="bg-red-100 rounded-lg p-2 mb-3">
                                                <div className="text-xs text-red-700 space-y-1">
                                                    {option.conflicts.slice(0, 3).map((conflict, cIdx) => (
                                                        <div key={cIdx} className="flex items-center gap-1">
                                                            <AlertTriangle size={10} />
                                                            <span>
                                                                <strong>{conflict.course1}</strong> {conflict.section1Type.substring(0, 3)} conflicts with{' '}
                                                                <strong>{conflict.course2}</strong> {conflict.section2Type.substring(0, 3)} on {conflict.day.substring(0, 3)} @ {conflict.time}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {option.conflicts.length > 3 && (
                                                        <div className="text-red-500">
                                                            +{option.conflicts.length - 3} more conflicts...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Section summary */}
                                        <div className="flex flex-wrap gap-1">
                                            {option.choices.map((choice, cIdx) => (
                                                <span
                                                    key={cIdx}
                                                    className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600"
                                                >
                                                    {choice.course.code}
                                                    {choice.mthsGroup
                                                        ? ` G${choice.mthsGroup}`
                                                        : ` L${choice.lectureId ? choice.sections.find(s => s.id === choice.lectureId)?.group : '-'}${choice.tutorialId ? `/T${choice.sections.find(s => s.id === choice.tutorialId)?.group}` : ''}`
                                                    }
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Apply button */}
                                    <button
                                        onClick={() => handleApply(option)}
                                        className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${option.hasConflicts
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                                            }`}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptimizerModal;
