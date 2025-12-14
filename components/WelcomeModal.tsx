import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onSubmit: (studentId: string) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onSubmit }) => {
    const [studentId, setStudentId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentId.trim().length > 0) {
            onSubmit(studentId.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome</h2>
                    <p className="text-blue-100 mt-2">Enter your Student ID to start</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Student ID
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                id="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                                placeholder="e.g. 20240123"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            This ID will be used to save and load your schedule automatically.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!studentId.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} />
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WelcomeModal;
