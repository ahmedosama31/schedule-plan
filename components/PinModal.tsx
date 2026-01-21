import React, { useState } from 'react';
import { Lock, ArrowRight, KeyRound, Trash2 } from 'lucide-react';

interface PinModalProps {
    isOpen: boolean;
    mode: 'login' | 'create';
    scheduleName?: string; // For login mode display
    onSubmit: (pin: string, name?: string) => void;
    onReset?: () => void; // For deleting schedule
    onCancel: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, mode, scheduleName, onSubmit, onReset, onCancel }) => {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length >= 4) {
            onSubmit(pin, mode === 'create' ? name : undefined);
            setPin('');
            setName('');
        }
    };

    if (confirmDelete) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-[--border-primary]">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                        <Trash2 size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-[--text-primary] mb-2">Delete Schedule?</h2>
                    <p className="text-sm text-[--text-secondary] mb-6">
                        This will permanently delete <span className="font-bold text-[--text-primary]">"{scheduleName || 'My Schedule'}"</span> and start over. This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2.5 text-[--text-tertiary] hover:text-[--text-primary] font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (onReset) onReset();
                                setConfirmDelete(false);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold shadow-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[--border-primary]">
                <div className="bg-[--bg-tertiary] p-6 flex flex-col items-center relative border-b border-[--border-primary]">
                    <div className="w-12 h-12 bg-[--text-primary] text-[--bg-primary] rounded-full flex items-center justify-center mb-3">
                        {mode === 'login' ? <Lock size={22} /> : <KeyRound size={22} />}
                    </div>
                    <h2 className="text-xl font-bold text-[--text-primary]">
                        {mode === 'login' ? 'Unlock Schedule' : 'Protect Schedule'}
                    </h2>

                    {mode === 'login' && scheduleName && (
                        <div className="mt-2 px-3 py-1 bg-[--bg-primary] text-[--text-secondary] rounded-full text-sm font-medium border border-[--border-primary]">
                            {scheduleName}
                        </div>
                    )}

                    <p className="text-sm text-[--text-tertiary] text-center mt-2 px-4">
                        {mode === 'login'
                            ? 'Enter the PIN to access this saved schedule.'
                            : 'Set a name and PIN to secure your plan.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {mode === 'create' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[--text-muted] uppercase tracking-wide">Schedule Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2.5 bg-[--bg-tertiary] border border-[--border-primary] rounded-xl outline-none text-sm text-[--text-primary] placeholder-[--text-muted] focus:ring-2 focus:ring-[--text-primary]/20"
                                placeholder="e.g. Fall 2026 Plan (Optional)"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[--text-muted] uppercase tracking-wide">4-Digit PIN (Numbers Only)</label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoFocus
                            value={pin}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setPin(value);
                            }}
                            className="w-full text-center text-2xl tracking-widest py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-xl focus:ring-2 focus:ring-[--text-primary]/20 outline-none text-[--text-primary] placeholder-[--text-muted]"
                            placeholder="0000"
                            maxLength={4}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2.5 text-[--text-tertiary] hover:text-[--text-primary] font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={pin.length < 4}
                            className="flex-1 bg-[--text-primary] hover:opacity-90 text-[--bg-primary] py-2.5 rounded-xl font-semibold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {mode === 'login' ? 'Unlock' : 'Save'}
                        </button>
                    </div>

                    {mode === 'login' && onReset && (
                        <div className="text-center pt-2 border-t border-[--border-primary]">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors"
                            >
                                Forgot PIN? Delete & Start Over
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PinModal;
