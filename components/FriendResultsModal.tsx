import React from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Clock, Users, X } from 'lucide-react';
import { FriendOptimizationResult, FriendScheduleOption } from '../friendOptimizer';

interface Props {
    result: FriendOptimizationResult | null;
    onApply: (option: FriendScheduleOption) => void;
    onClose: () => void;
}

const formatGap = (hours: number) => {
    const roundedMinutes = Math.round(hours * 60);
    if (roundedMinutes === 0) return 'No gaps';
    const wholeHours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    return [wholeHours ? `${wholeHours}h` : '', minutes ? `${minutes}m` : ''].filter(Boolean).join(' ');
};

const Metrics: React.FC<{ label: string; option: FriendScheduleOption['student1'] }> = ({ label, option }) => (
    <div className="rounded-lg bg-[--bg-tertiary] p-3 text-xs text-[--text-secondary]">
        <div className="mb-2 font-semibold text-[--text-primary]">{label}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1"><Calendar size={12} />{option.dayCount} days</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} />{formatGap(option.gapScore)}</span>
            <span>{option.healthScore}/100 health</span>
        </div>
    </div>
);

const FriendResultsModal: React.FC<Props> = ({ result, onApply, onClose }) => {
    if (!result) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[--border-primary] bg-[--bg-primary] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[--border-primary] p-5">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold"><Users size={20} />Friend schedule options</h2>
                        <p className="mt-1 text-xs text-[--text-muted]">Top {result.options.length} compatible pair{result.options.length === 1 ? '' : 's'}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[--text-muted] hover:bg-[--bg-tertiary]"><X size={18} /></button>
                </div>
                {result.metadata.searchWasLimited && (
                    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                        <AlertTriangle size={15} />These are the best options found within the optimizer search limit.
                    </div>
                )}
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {result.options.length === 0 ? (
                        <div className="py-12 text-center text-[--text-muted]">No compatible schedule pair satisfies both students’ constraints.</div>
                    ) : result.options.map((option, index) => (
                        <article key={`${index}-${option.matchCount}`} className="rounded-xl border border-[--border-primary] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {index === 0 && <CheckCircle2 size={17} className="text-emerald-500" />}
                                        <h3 className="font-bold">{option.matchCount} of {option.matchableCount} shared sections</h3>
                                    </div>
                                    <p className="mt-1 text-xs text-[--text-muted]">{Math.round(option.matchRatio * 100)}% together · balanced score {Math.round(option.balancedScore * 100)}</p>
                                </div>
                                <button onClick={() => onApply(option)} className="rounded-xl bg-[--text-primary] px-4 py-2 text-sm font-semibold text-[--bg-primary] hover:opacity-90">Apply pair</button>
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <Metrics label="Student 1" option={option.student1} />
                                <Metrics label="Student 2" option={option.student2} />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {option.matchedSections.length === 0 ? (
                                    <span className="text-xs text-[--text-muted]">No selected courses have a matchable lecture or tutorial.</span>
                                ) : option.matchedSections.map(item => (
                                    <span key={`${item.courseCode}-${item.type}-${item.section.id}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                                        {item.courseCode} {item.type === 'Lecture' ? 'Lec' : 'Tut'} {item.section.group}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FriendResultsModal;
