import React, { useState } from 'react';
import { X, Link, Check } from 'lucide-react';
import { CourseSelection } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selections: CourseSelection[];
}

const ShareModal: React.FC<Props> = ({ isOpen, onClose, selections }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const generateShareLink = () => {
        // Create a minimal JSON representation of the schedule
        const scheduleData = selections.map(s => ({
            c: s.course.code,
            l: s.selectedLectureId,
            t: s.selectedTutorialId,
            b: s.selectedLabId,
            m: s.selectedMthsGroup
        }));

        // Encode to base64 and create URL
        const encoded = btoa(JSON.stringify(scheduleData));
        const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
        return url;
    };

    const handleCopyLink = async () => {
        const link = generateShareLink();
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy link. Please copy manually.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Share Schedule</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Share your schedule with friends! They can view it and save their own copy.
                    </p>

                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                        {copied ? (
                            <>
                                <Check size={18} />
                                Link Copied!
                            </>
                        ) : (
                            <>
                                <Link size={18} />
                                Copy Share Link
                            </>
                        )}
                    </button>

                    {copied && (
                        <p className="mt-3 text-xs text-center text-green-600 dark:text-green-400">
                            ✓ Link copied to clipboard
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
