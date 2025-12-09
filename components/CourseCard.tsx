import React from 'react';
import { Course, CourseSelection, SectionType, Section } from '../types';
import { getConflict } from '../utils';
import { Trash2, AlertCircle } from 'lucide-react';

interface Props {
  selection: CourseSelection;
  allSelections: CourseSelection[];
  onRemove: () => void;
  onUpdate: (updated: CourseSelection) => void;
}

const CourseCard: React.FC<Props> = ({ selection, allSelections, onRemove, onUpdate }) => {
  const { course } = selection;

  const lectures = course.sections.filter(s => s.type === SectionType.Lecture);
  const tutorials = course.sections.filter(s => s.type === SectionType.Tutorial);
  const labs = course.sections.filter(s => s.type === SectionType.Lab);

  // Group MTHS sections by group ID
  const mthsGroups = course.isMTHS ? Array.from(new Set(course.sections.map(s => s.group))).sort() : [];

  const handleMthsGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...selection, selectedMthsGroup: e.target.value });
  };

  const handleSectionChange = (type: 'lecture' | 'tutorial' | 'lab', sectionId: string) => {
    const update = { ...selection };
    if (type === 'lecture') update.selectedLectureId = sectionId;
    if (type === 'tutorial') update.selectedTutorialId = sectionId;
    if (type === 'lab') update.selectedLabId = sectionId;
    onUpdate(update);
  };

  const renderSectionOption = (section: Section) => {
    const conflict = getConflict(section, allSelections);
    const times = section.sessions.map(s => `${s.day.substring(0,3)} ${s.startString}-${s.endString}`).join(', ');
    return (
      <option key={section.id} value={section.id} disabled={!!conflict} className={conflict ? 'text-red-400' : ''}>
         {conflict ? '⚠ ' : ''} Grp {section.group}: {times} {conflict ? '(Conflict)' : ''}
      </option>
    );
  };

  const renderMthsOption = (group: string) => {
    const groupSections = course.sections.filter(s => s.group === group);
    // Determine if this group has a conflict
    let conflict: string | null = null;
    for(const sec of groupSections) {
         const c = getConflict(sec, allSelections);
         if (c) {
             conflict = c;
             break;
         }
    }

    const details = groupSections.map(s => `${s.type.substring(0,3)}: ${s.sessions[0].day.substring(0,3)} ${s.sessions[0].startString}`).join(', ');
    
    return (
        <option key={group} value={group} disabled={!!conflict}>
            {conflict ? '⚠ ' : ''} Group {group} ({details}) {conflict ? '(Conflict)' : ''}
        </option>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-800">{course.code}</h3>
          <p className="text-xs text-slate-500">{course.name}</p>
        </div>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {course.isMTHS ? (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section Group</label>
            <select
              className="w-full text-sm p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={selection.selectedMthsGroup || ''}
              onChange={handleMthsGroupChange}
            >
              <option value="">Select Group...</option>
              {mthsGroups.map(renderMthsOption)}
            </select>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
               <AlertCircle size={10} /> Same Lec/Tut group required
            </div>
          </div>
        ) : (
          <>
            {lectures.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lecture</label>
                <select
                  className="w-full text-sm p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selection.selectedLectureId || ''}
                  onChange={(e) => handleSectionChange('lecture', e.target.value)}
                >
                  <option value="">Select Lecture...</option>
                  {lectures.map(renderSectionOption)}
                </select>
              </div>
            )}
            
            {tutorials.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tutorial</label>
                <select
                  className="w-full text-sm p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selection.selectedTutorialId || ''}
                  onChange={(e) => handleSectionChange('tutorial', e.target.value)}
                >
                  <option value="">Select Tutorial...</option>
                  {tutorials.map(renderSectionOption)}
                </select>
              </div>
            )}
            
            {labs.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Laboratory</label>
                <select
                  className="w-full text-sm p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selection.selectedLabId || ''}
                  onChange={(e) => handleSectionChange('lab', e.target.value)}
                >
                  <option value="">Select Lab...</option>
                  {labs.map(renderSectionOption)}
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
