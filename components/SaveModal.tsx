import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Plus, Clock, Trash2, Lock } from 'lucide-react';
import { fetchUserSchedules, UserScheduleInfo, deleteSchedule } from '../lib/api';

interface SaveModalProps {
    isOpen: boolean;
    studentId: string;
    currentScheduleName: string | null;
    onSave: (name: string, saveLocks: boolean) => void;
    onLoad: (name: string) => void;
    onClose: () => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, studentId, currentScheduleName, onSave, onLoad, onClose }) => {
    const [scheduleName, setScheduleName] = useState('');
    const [savedSchedules, setSavedSchedules] = useState<UserScheduleInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
    const [saveLocks, setSaveLocks] = useState(true);

    useEffect(() => {
        if (isOpen && studentId) {
            loadSavedSchedules();
        }
    }, [isOpen, studentId]);

    const loadSavedSchedules = async () => {
        setIsLoading(true);
        const schedules = await fetchUserSchedules(studentId);
        setSavedSchedules(schedules);
        setIsLoading(false);
    };

    const handleSave = () => {
        const name = scheduleName.trim();
        if (!name) {
            alert('Please enter a schedule name');
            return;
        }
        onSave(name, saveLocks);
        setScheduleName('');
        onClose();
    };

    const handleLoad = (name: string) => {
        onLoad(name);
        onClose();
    };

    const handleDelete = async (name: string) => {
        if (!confirm(`Delete schedule "${name}"?`)) return;
        const success = await deleteSchedule(studentId, name);
        if (success) {
            loadSavedSchedules();
        } else {
            alert('Failed to delete schedule');
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[--border-primary]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[--border-primary]">
                    <h2 className="text-lg font-bold text-[--text-primary]">
                        Manage Schedules
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-[--bg-tertiary] text-[--text-muted] transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[--border-primary]">
                    <button
                        onClick={() => setActiveTab('save')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'save'
                            ? 'text-[--text-primary] border-b-2 border-[--text-primary]'
                            : 'text-[--text-muted] hover:text-[--text-secondary]'
                            }`}
                    >
                        <Plus size={16} />
                        Save New
                    </button>
                    <button
                        onClick={() => setActiveTab('load')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'load'
                            ? 'text-[--text-primary] border-b-2 border-[--text-primary]'
                            : 'text-[--text-muted] hover:text-[--text-secondary]'
                            }`}
                    >
                        <FolderOpen size={16} />
                        My Schedules
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeTab === 'save' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                    Schedule Name
                                </label>
                                <input
                                    type="text"
                                    value={scheduleName}
                                    onChange={(e) => setScheduleName(e.target.value)}
                                    placeholder="e.g., Plan A, Backup, Morning Classes..."
                                    className="w-full px-4 py-3 bg-[--bg-tertiary] border border-[--border-primary] rounded-xl focus:ring-2 focus:ring-[--text-primary]/20 focus:border-[--text-secondary] outline-none text-[--text-primary] placeholder-[--text-muted]"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                            <p className="text-xs text-[--text-muted]">
                                Your current schedule will be saved under this name. You can create multiple saved schedules.
                            </p>

                            {/* Save Locks Toggle */}
                            <div className="flex items-center justify-between p-3 bg-[--bg-tertiary] rounded-xl border border-[--border-primary]">
                                <div className="flex items-center gap-2">
                                    <Lock size={16} className="text-amber-500" />
                                    <div>
                                        <span className="text-sm font-medium text-[--text-secondary]">Save locked sections</span>
                                        <p className="text-xs text-[--text-muted]">Include lock state for optimizer</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSaveLocks(!saveLocks)}
                                    className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 p-0.5 ${saveLocks ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                                >
                                    <span
                                        className={`block w-4 h-4 bg-white dark:bg-neutral-900 rounded-full shadow-sm transition-transform ${saveLocks ? 'translate-x-4' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-[--text-primary] hover:opacity-90 text-[--bg-primary] py-3 px-4 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Save size={18} />
                                Save Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-[--text-muted]">
                                    Loading...
                                </div>
                            ) : savedSchedules.length === 0 ? (
                                <div className="text-center py-8 text-[--text-muted]">
                                    <FolderOpen size={32} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm font-medium">No saved schedules yet</p>
                                    <p className="text-xs mt-1">Save your first schedule using the "Save New" tab</p>
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {savedSchedules.map((schedule) => (
                                        <div
                                            key={schedule.name}
                                            className={`p-3 rounded-xl border transition-colors ${schedule.name === currentScheduleName
                                                ? 'bg-[--bg-tertiary] border-[--text-primary]/30'
                                                : 'bg-[--bg-primary] border-[--border-primary] hover:bg-[--bg-tertiary]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-[--text-primary] truncate">
                                                            {schedule.name}
                                                        </span>
                                                        {schedule.name === currentScheduleName && (
                                                            <span className="text-[10px] bg-[--text-primary] text-[--bg-primary] px-2 py-0.5 rounded-full font-medium">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-[--text-muted] mt-1">
                                                        <Clock size={12} />
                                                        <span>Updated {formatDate(schedule.updated_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <button
                                                        onClick={() => handleLoad(schedule.name)}
                                                        className="p-2 rounded-lg bg-[--text-primary] hover:opacity-90 text-[--bg-primary] transition-colors"
                                                        title="Load this schedule"
                                                    >
                                                        <FolderOpen size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.name)}
                                                        className="p-2 rounded-lg bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                                                        title="Delete this schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer - Current schedule info */}
                {currentScheduleName && (
                    <div className="px-4 pb-4">
                        <div className="text-xs text-[--text-muted] text-center bg-[--bg-tertiary] rounded-lg py-2 border border-[--border-primary]">
                            Currently editing: <span className="font-semibold text-[--text-secondary]">{currentScheduleName}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaveModal;
