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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[--border-primary]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[--border-primary]">
                    <h2 className="text-lg font-bold text-[--text-primary]">Share Schedule</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[--bg-tertiary] rounded-lg transition-colors"
                    >
                        <X size={18} className="text-[--text-muted]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-[--text-secondary] mb-5">
                        Share your schedule with friends! They can view it and save their own copy.
                    </p>

                    <button
                        onClick={handleCopyLink}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[--text-primary] hover:opacity-90 text-[--bg-primary]'
                            }`}
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
                        <p className="mt-3 text-xs text-center text-emerald-600 dark:text-emerald-400">
                            ✓ Link copied to clipboard
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
