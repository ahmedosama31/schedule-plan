import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CourseSelection, DayOfWeek, SectionType, CandidateItem } from '../types';

interface Props {
  selections: CourseSelection[];
  candidateSections?: CandidateItem[];
}

interface RenderItem {
  id: string;
  name: string;
  type: SectionType;
  day: DayOfWeek;
  start: number;
  end: number;
  color: string;
  isMTHS: boolean;
  // Tiling properties
  column: number;
  totalColumns: number;
  location?: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00 (8pm)
const DAYS = [DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday];

// Check if two time ranges overlap
const timesOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
  return start1 < end2 && start2 < end1;
};

// Calculate tiling for overlapping events
const tileEvents = (items: Omit<RenderItem, 'column' | 'totalColumns'>[]): RenderItem[] => {
  if (items.length === 0) return [];

  // Sort by start time, then by end time
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);

  // Assign columns to each event
  const tiledItems: RenderItem[] = [];
  const columns: { end: number }[] = []; // Track when each column becomes free

  for (const item of sorted) {
    // Find the first available column
    let column = 0;
    while (column < columns.length && columns[column].end > item.start) {
      column++;
    }

    // Assign or create column
    if (column >= columns.length) {
      columns.push({ end: item.end });
    } else {
      columns[column].end = item.end;
    }

    tiledItems.push({ ...item, column, totalColumns: 0 }); // totalColumns will be calculated later
  }

  // Now we need to calculate totalColumns for each event based on overlapping events
  for (let i = 0; i < tiledItems.length; i++) {
    // Find all events that overlap with this one
    const overlapping = tiledItems.filter(other =>
      timesOverlap(tiledItems[i].start, tiledItems[i].end, other.start, other.end)
    );

    // The maximum column number + 1 among overlapping events is the totalColumns
    const maxColumn = Math.max(...overlapping.map(e => e.column));
    tiledItems[i].totalColumns = maxColumn + 1;
  }

  // Second pass: ensure all overlapping events have the same totalColumns
  for (let i = 0; i < tiledItems.length; i++) {
    const overlapping = tiledItems.filter(other =>
      timesOverlap(tiledItems[i].start, tiledItems[i].end, other.start, other.end)
    );
    const maxTotalColumns = Math.max(...overlapping.map(e => e.totalColumns));
    for (const item of overlapping) {
      item.totalColumns = maxTotalColumns;
    }
  }

  return tiledItems;
};

const DraggableEvent: React.FC<{ item: RenderItem, style: React.CSSProperties, className: string }> = ({ item, style, className }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,

  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition: 'none', // Disable CSS transitions while dragging for smooth movement
    zIndex: 50,
    opacity: 0.8,
    cursor: 'grabbing'
  } : { cursor: 'grab' };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...dragStyle }}
      className={`${className} ${isDragging ? 'ring-2 ring-black shadow-xl' : ''}`}
      {...listeners}
      {...attributes}
      title={`${item.name} ${item.type}${item.isMTHS ? ' (Linked Group)' : ''}`}
    >
      <div className="font-bold truncate pointer-events-none">{item.name}</div>
      <div className="opacity-90 truncate text-[10px] pointer-events-none">{item.type.substring(0, 3)}</div>
      <div className="opacity-75 text-[10px] pointer-events-none">{formatTime(item.start)} - {formatTime(item.end)}</div>
      {item.location && (item.location.includes('الشيخ زايد') || item.location.includes('Sheikh Zayed')) && (
        <div className="mt-0.5 text-[9px] font-bold text-red-600 bg-red-100 rounded px-1 w-fit pointer-events-none">
          Sheikh Zayed
        </div>
      )}
    </div>
  );
};

const DroppableCandidate: React.FC<{ item: CandidateItem, style: React.CSSProperties }> = ({ item, style }) => {
  // Unique droppable ID. 
  // Since candidateItems are session-based, let's use a unique key if id is shared.
  // However, dnd-kit requires unique IDs. We'll rely on item.id which we will make unique in App.tsx
  const { setNodeRef, isOver } = useDroppable({
    id: item.id,
    data: { isCandidate: true, ...item }
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute rounded-md p-1.5 text-xs border-2 border-dashed transition-all z-40 flex flex-col justify-center items-center font-semibold 
                ${isOver ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105 shadow-lg opacity-100' : 'bg-white/90 border-slate-400 text-slate-500 hover:bg-slate-50 opacity-90'}`}
    >
      <div className="pointer-events-none">{item.label}</div>
      <div className="text-[10px] pointer-events-none">{formatTime(item.start)} - {formatTime(item.end)}</div>
      {isOver && <div className="text-[10px] font-bold mt-1 pointer-events-none">Drop Here</div>}
    </div>
  );
};


const ScheduleGrid: React.FC<Props> = ({ selections, candidateSections = [] }) => {
  // Flatten all selected sections into renderable items
  const renderItems: RenderItem[] = React.useMemo(() => {
    const rawItems: Omit<RenderItem, 'column' | 'totalColumns'>[] = [];

    for (const selection of selections) {
      const { course } = selection;
      let sectionsToRender: any[] = [];

      if (course.isMTHS && selection.selectedMthsGroup) {
        sectionsToRender = course.sections.filter(s => s.group === selection.selectedMthsGroup);
      } else {
        if (selection.selectedLectureId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLectureId));
        if (selection.selectedTutorialId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedTutorialId));
        if (selection.selectedLabId) sectionsToRender.push(course.sections.find(s => s.id === selection.selectedLabId));
      }

      // Filter out undefineds
      sectionsToRender = sectionsToRender.filter(Boolean);

      for (const section of sectionsToRender) {
        for (const session of section.sessions) {
          rawItems.push({
            id: section.id, // NOTE: Multiple sessions share this ID. This is bad for dnd-kit draggable ID!
            // Dragging one session should drag the whole section conceptually?
            // If I reuse ID, dnd-kit will pick the first one.
            // I should make ID unique per session: `${section.id}-${day}-${start}`
            // But dragging *any* session should identify the section.
            // Let's attach unique key to draggable, but data points to real section ID.

            name: course.code,
            type: section.type,
            day: session.day,
            start: session.startHour,
            end: session.endHour,
            color: getColorForCourse(course.code),
            isMTHS: course.isMTHS,
            location: session.location
          });
        }
      }
    }

    // Uniqueness fix:
    // We Map rawItems and append suffix to ID to make them valid unique keys for map/dnd
    const uniqueRawItems = rawItems.map(item => ({
      ...item,
      // We keep original ID for logic, but need a unique ID for rendering/dragging? 
      // No, RenderItem.id is used for useDraggable id. 
      // If I change it, I must handle it in App.tsx.
      // Actually, if a section has 2 sessions (Mon/Wed), and I drag Mon, 
      // Wed session should probably stay? Or drag both?
      // UI wise, it's easier to drag just the one tile.
      // So let's make unique IDs: section.id + session suffix.
      id: `${item.id}|${item.day}|${item.start}`
    }));

    // Group by day and apply tiling
    const tiledItems: RenderItem[] = [];
    for (const day of DAYS) {
      const dayItems = uniqueRawItems.filter(item => item.day === day);
      tiledItems.push(...tileEvents(dayItems));
    }

    return tiledItems;
  }, [selections]);

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 overflow-hidden flex flex-col h-full transition-colors border-slate-200 dark:border-slate-700"
    >
      <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="p-3 text-xs font-semibold text-slate-400 dark:text-slate-500 text-center border-r border-slate-100 dark:border-slate-700">Time</div>
        {DAYS.map(day => (
          <div key={day} className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-100 dark:border-slate-700 last:border-0">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto schedule-scroll relative">
        <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_1fr] min-h-[800px]">
          {/* Time Labels */}
          <div className="border-r border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {HOURS.map(hour => (
              <div key={hour} className="h-16 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 p-1 text-center relative">
                <span className="absolute -top-2 left-0 right-0">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {DAYS.map(day => (
            <div key={day} className="relative border-r border-slate-100 dark:border-slate-700 last:border-0">
              {/* Grid lines */}
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-slate-50 dark:border-slate-700/50"></div>
              ))}

              {/* Render User Events */}
              {renderItems.filter((item) => item.day === day).map((item) => {
                const top = (item.start - 7) * 64;
                const height = (item.end - item.start) * 64;
                const widthPercent = 100 / item.totalColumns;
                const leftPercent = widthPercent * item.column;
                const padding = 2;

                return (
                  <DraggableEvent
                    key={item.id}
                    item={item}
                    className={`absolute rounded-md p-1.5 text-xs shadow-sm border-l-4 overflow-hidden hover:z-30 transition-all hover:shadow-md ${item.color}`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `calc(${leftPercent}% + ${padding}px)`,
                      width: `calc(${widthPercent}% - ${padding * 2}px)`
                    }}
                  />
                );
              })}

              {/* Render Candidate Slots (Overlays) */}
              {candidateSections.filter(c => c.day === day).map((c) => {
                const top = (c.start - 7) * 64;
                const height = (c.end - c.start) * 64;
                return (
                  <DroppableCandidate
                    key={c.id}
                    item={c}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: '2px',
                      right: '2px',
                      width: 'calc(100% - 4px)'
                    }}
                  />
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
