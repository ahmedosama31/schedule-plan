import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Plus, Clock, Trash2 } from 'lucide-react';
import { fetchUserSchedules, UserScheduleInfo, deleteSchedule } from '../lib/api';

interface SaveModalProps {
    isOpen: boolean;
    studentId: string;
    currentScheduleName: string | null;
    onSave: (name: string) => void;
    onLoad: (name: string) => void;
    onClose: () => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, studentId, currentScheduleName, onSave, onLoad, onClose }) => {
    const [scheduleName, setScheduleName] = useState('');
    const [savedSchedules, setSavedSchedules] = useState<UserScheduleInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');

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
        onSave(name);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Manage Schedules
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('save')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'save'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Plus size={16} />
                        Save New
                    </button>
                    <button
                        onClick={() => setActiveTab('load')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'load'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Schedule Name
                                </label>
                                <input
                                    type="text"
                                    value={scheduleName}
                                    onChange={(e) => setScheduleName(e.target.value)}
                                    placeholder="e.g., Plan A, Backup, Morning Classes..."
                                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Your current schedule will be saved under this name. You can create multiple saved schedules.
                            </p>
                            <button
                                onClick={handleSave}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Save Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">
                                    Loading...
                                </div>
                            ) : savedSchedules.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No saved schedules yet</p>
                                    <p className="text-xs mt-1">Save your first schedule using the "Save New" tab</p>
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {savedSchedules.map((schedule) => (
                                        <div
                                            key={schedule.name}
                                            className={`p-3 rounded-lg border transition-colors ${schedule.name === currentScheduleName
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                            {schedule.name}
                                                        </span>
                                                        {schedule.name === currentScheduleName && (
                                                            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <Clock size={12} />
                                                        <span>Updated {formatDate(schedule.updated_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button
                                                        onClick={() => handleLoad(schedule.name)}
                                                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                                        title="Load this schedule"
                                                    >
                                                        <FolderOpen size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.name)}
                                                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                                                        title="Delete this schedule"
                                                    >
                                                        <Trash2 size={16} />
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
                        <div className="text-xs text-slate-500 dark:text-slate-400 text-center bg-slate-100 dark:bg-slate-700/50 rounded-lg py-2">
                            Currently editing: <span className="font-semibold">{currentScheduleName}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaveModal;
