import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[--border-primary]">
                <div className="bg-[--text-primary] p-8 text-[--bg-primary] text-center">
                    <div className="mx-auto bg-[--bg-primary]/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <User size={28} />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome</h2>
                    <p className="text-[--bg-primary]/70 mt-2 text-sm">Enter your Student ID to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-[--text-secondary] mb-2">
                            Student ID
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-[--text-muted]" size={18} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                id="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-xl focus:ring-2 focus:ring-[--text-primary]/20 focus:border-[--text-secondary] outline-none text-[--text-primary] placeholder-[--text-muted]"
                                placeholder="e.g. 20240123"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-[--text-muted] mt-2">
                            This ID will be used to save and load your schedule automatically.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!studentId.trim()}
                        className="w-full bg-[--text-primary] hover:opacity-90 text-[--bg-primary] py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span>Continue</span>
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WelcomeModal;
