import React from 'react';
import { CourseSelection, DayOfWeek, SectionType } from '../types';

interface Props {
  selections: CourseSelection[];
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00 (8pm)
const DAYS = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday];

const ScheduleGrid: React.FC<Props> = ({ selections }) => {
  // Flatten all selected sections into renderable items
  const renderItems = selections.flatMap(selection => {
    const items = [];
    const { course } = selection;
    let sectionsToRender = [];

    if (course.isMTHS && selection.selectedMthsGroup) {
      sectionsToRender = course.sections.filter(s => s.group === selection.selectedMthsGroup);
    } else {
      if (selection.selectedLectureId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLectureId));
      if (selection.selectedTutorialId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedTutorialId));
      if (selection.selectedLabId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLabId));
    }

    // Filter out undefineds
    sectionsToRender = sectionsToRender.filter(Boolean) as any[];

    sectionsToRender.forEach(section => {
      section.sessions.forEach((session: any) => {
        items.push({
          id: section.id,
          name: course.code,
          type: section.type,
          day: session.day,
          start: session.startHour,
          end: session.endHour,
          color: getColorForCourse(course.code)
        });
      });
    });

    return items;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 bg-slate-50">
        <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-100">Time</div>
        {DAYS.map(day => (
          <div key={day} className="p-3 text-sm font-semibold text-slate-700 text-center border-r border-slate-100 last:border-0">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto schedule-scroll relative">
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] min-h-[800px]">
           {/* Time Labels */}
           <div className="border-r border-slate-100 bg-slate-50">
             {HOURS.map(hour => (
               <div key={hour} className="h-16 border-b border-slate-100 text-xs text-slate-400 p-1 text-center relative">
                 <span className="absolute -top-2 left-0 right-0">{hour}:00</span>
               </div>
             ))}
           </div>

           {/* Day Columns */}
           {DAYS.map(day => (
             <div key={day} className="relative border-r border-slate-100 last:border-0">
               {/* Grid lines */}
               {HOURS.map(hour => (
                 <div key={hour} className="h-16 border-b border-slate-50"></div>
               ))}

               {/* Render Events */}
               {renderItems.filter((item: any) => item.day === day).map((item: any, idx) => {
                 const top = (item.start - 7) * 64; // 64px per hour (h-16)
                 const height = (item.end - item.start) * 64;
                 return (
                   <div
                     key={`${item.id}-${idx}`}
                     className={`absolute left-1 right-1 rounded-md p-1.5 text-xs shadow-sm border-l-4 overflow-hidden hover:z-10 transition-all hover:shadow-md cursor-help ${item.color}`}
                     style={{ top: `${top}px`, height: `${height}px` }}
                     title={`${item.name} ${item.type}`}
                   >
                     <div className="font-bold truncate">{item.name}</div>
                     <div className="opacity-90 truncate text-[10px]">{item.type.substring(0,3)}</div>
                     <div className="opacity-75 text-[10px]">{formatTime(item.start)} - {formatTime(item.end)}</div>
                   </div>
                 );
               })}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const formatTime = (decimal: number) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getColorForCourse = (code: string) => {
  const colors = [
    'bg-blue-100 border-blue-500 text-blue-800',
    'bg-emerald-100 border-emerald-500 text-emerald-800',
    'bg-purple-100 border-purple-500 text-purple-800',
    'bg-amber-100 border-amber-500 text-amber-800',
    'bg-rose-100 border-rose-500 text-rose-800',
    'bg-indigo-100 border-indigo-500 text-indigo-800',
    'bg-cyan-100 border-cyan-500 text-cyan-800',
    'bg-lime-100 border-lime-500 text-lime-800',
  ];
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default ScheduleGrid;
