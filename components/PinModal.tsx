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
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Schedule?</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        This will permanently delete <span className="font-bold text-slate-700 dark:text-slate-300">"{scheduleName || 'My Schedule'}"</span> and start over. This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2 text-slate-500 hover:text-slate-700 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (onReset) onReset();
                                setConfirmDelete(false);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold shadow-md"
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-100 dark:bg-slate-700 p-6 flex flex-col items-center relative">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        {mode === 'login' ? <Lock size={24} /> : <KeyRound size={24} />}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {mode === 'login' ? 'Unlock Schedule' : 'Protect Schedule'}
                    </h2>

                    {mode === 'login' && scheduleName && (
                        <div className="mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800">
                            {scheduleName}
                        </div>
                    )}

                    <p className="text-sm text-slate-500 text-center mt-2 px-4">
                        {mode === 'login'
                            ? 'Enter the PIN to access this saved schedule.'
                            : 'Set a name and PIN to secure your plan.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {mode === 'create' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Schedule Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg outline-none text-sm"
                                placeholder="e.g. Fall 2026 Plan (Optional)"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">4-Digit PIN (Numbers Only)</label>
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
                            className="w-full text-center text-2xl tracking-widest py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                            placeholder="0000"
                            maxLength={4}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={pin.length < 4}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {mode === 'login' ? 'Unlock' : 'Save'}
                        </button>
                    </div>

                    {mode === 'login' && onReset && (
                        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="text-xs text-red-500 hover:text-red-600 hover:underline"
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
