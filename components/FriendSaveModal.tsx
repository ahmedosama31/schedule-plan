import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    studentIds: [string, string];
    initialNames: [string, string];
    sourceNames: [string | null, string | null];
    existingNames: [string[], string[]];
    canSaveStudents: [boolean, boolean];
    canSaveBoth: boolean;
    isSaving: boolean;
    error?: string | null;
    onSave: (names: [string, string], scope: FriendSaveScope) => void;
    onClose: () => void;
}

export type FriendSaveScope = 'student-1' | 'student-2' | 'both';

const FriendSaveModal: React.FC<Props> = ({ isOpen, studentIds, initialNames, sourceNames, existingNames, canSaveStudents, canSaveBoth, isSaving, error, onSave, onClose }) => {
    const [names, setNames] = useState<[string, string]>(initialNames);

    useEffect(() => {
        if (isOpen) setNames(initialNames);
    }, [isOpen, initialNames[0], initialNames[1]]);

    if (!isOpen) return null;

    const submit = (scope: FriendSaveScope) => {
        const trimmed: [string, string] = [names[0].trim(), names[1].trim()];
        const selectedIndices = scope === 'both' ? [0, 1] : [scope === 'student-1' ? 0 : 1];
        if (selectedIndices.some(index => !trimmed[index])) return;
        if (selectedIndices.some(index => trimmed[index] === sourceNames[index])) {
            alert('Matched schedules must use new names so the loaded originals stay unchanged.');
            return;
        }
        const collisions = selectedIndices
            .map(index => trimmed[index])
            .filter((name, position) => existingNames[selectedIndices[position]].includes(name));
        if (collisions.length > 0 && !confirm(`Overwrite existing matched schedule${collisions.length > 1 ? 's' : ''}: ${collisions.join(', ')}?`)) return;
        onSave(trimmed, scope);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-[--border-primary] bg-[--bg-primary] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[--border-primary] p-4">
                    <div><h2 className="font-bold">Save matched schedules</h2><p className="mt-1 text-xs text-[--text-muted]">Save either student or both. Loaded originals stay unchanged.</p></div>
                    <button disabled={isSaving} onClick={onClose} className="rounded-lg p-2 text-[--text-muted] hover:bg-[--bg-tertiary]"><X size={18} /></button>
                </div>
                <div className="space-y-4 p-4">
                    {studentIds.map((id, index) => (
                        <label key={id} className="block text-sm font-medium text-[--text-secondary]">
                            Student {index + 1} · {id}
                            <input value={names[index]} onChange={(event) => setNames(previous => {
                                const next: [string, string] = [...previous];
                                next[index] = event.target.value;
                                return next;
                            })} className="mt-2 w-full rounded-xl border border-[--border-primary] bg-[--bg-tertiary] px-3 py-2.5 text-[--text-primary] outline-none focus:border-[--text-secondary]" />
                        </label>
                    ))}
                    {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
                    <div className="grid gap-2 sm:grid-cols-2">
                        {[0, 1].map(index => (
                            <button
                                key={studentIds[index]}
                                disabled={isSaving || !canSaveStudents[index] || !names[index].trim()}
                                onClick={() => submit(index === 0 ? 'student-1' : 'student-2')}
                                className="flex items-center justify-center gap-2 rounded-xl border border-[--border-primary] py-2.5 text-sm font-semibold text-[--text-primary] hover:bg-[--bg-tertiary] disabled:opacity-40"
                            >
                                <Save size={16} />Save Student {index + 1}
                            </button>
                        ))}
                    </div>
                    <button disabled={isSaving || !canSaveBoth || !names[0].trim() || !names[1].trim()} onClick={() => submit('both')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[--text-primary] py-3 font-semibold text-[--bg-primary] disabled:opacity-40">
                        <Save size={17} />{isSaving ? 'Saving…' : 'Save both'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FriendSaveModal;
