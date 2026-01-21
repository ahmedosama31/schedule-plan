import { AlertCircle, Clock, Lock, Unlock } from 'lucide-react';
import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CourseSelection, DayOfWeek, SectionType, CandidateItem } from '../types';

interface Props {
  selections: CourseSelection[];
  candidateSections?: CandidateItem[];
  onMobileReschedule?: (sectionId: string) => void;
  onUpdateSelection?: (updated: CourseSelection) => void;
  onToggleLock?: (courseCode: string, sectionType: SectionType) => void;
}

interface RenderItem {
  id: string;
  name: string;
  courseName: string;
  type: SectionType;
  day: DayOfWeek;
  start: number;
  end: number;
  color: string;
  isMTHS: boolean;
  isLocked: boolean;
  // Tiling properties
  column: number;
  totalColumns: number;
  location?: string;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00 (8pm)
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

const DraggableEvent: React.FC<{
  item: RenderItem;
  className: string;
  style: React.CSSProperties;
  onMobileTap?: () => void;
  onToggleLock?: () => void;
}> = ({ item, className, style, onMobileTap, onToggleLock }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { sectionId: item.id, name: item.name, courseCode: item.name, type: item.type, isMTHS: item.isMTHS }
  });

  const dragStyle = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 1000
    }
    : undefined;

  // Detect overlap if the item is sharing space with others
  const isOverlapping = item.totalColumns > 1;

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...dragStyle }}
      className={`${className} ${isDragging ? 'ring-2 ring-black shadow-xl' : ''} ${isOverlapping ? 'border-red-400 border-2' : ''} ${item.isLocked ? 'ring-2 ring-yellow-500' : ''}`}
      {...(onMobileTap ? { onClick: onMobileTap } : listeners)}
      {...attributes}
      title={`${item.name} ${item.type}${item.isMTHS ? ' (Linked Group)' : ''}${isOverlapping ? ' - OVERLAPPING' : ''}${item.isLocked ? ' - LOCKED' : ''}`}
    >
      <div className="font-bold truncate pointer-events-none flex items-center gap-1">
        {isOverlapping && <AlertCircle size={12} className="text-red-500 fill-white" />}
        <span>{item.name}</span>
        {/* Lock icon button */}
        {onToggleLock && (
          <button
            onClick={handleLockClick}
            className={`ml-auto pointer-events-auto p-0.5 rounded transition-colors ${item.isLocked ? 'text-yellow-600 bg-yellow-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            title={item.isLocked ? 'Click to unlock from optimization' : 'Click to lock (keep during optimization)'}
          >
            {item.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        )}
      </div>
      <div className="text-[10px] opacity-80 truncate pointer-events-none">{item.courseName}</div>
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


const ScheduleGrid: React.FC<Props> = ({ selections, candidateSections = [], onMobileReschedule, onUpdateSelection, onToggleLock }) => {
  const [mobileRescheduleItem, setMobileRescheduleItem] = React.useState<RenderItem | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find the course selection for mobile reschedule
  const mobileRescheduleSelection = React.useMemo(() => {
    if (!mobileRescheduleItem) return null;
    return selections.find(s => s.course.code === mobileRescheduleItem.name);
  }, [mobileRescheduleItem, selections]);

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
        // Determine if this section is locked
        let isLocked = false;
        if (course.isMTHS) {
          isLocked = !!selection.lockedMthsGroup;
        } else {
          if (section.type === SectionType.Lecture) isLocked = !!selection.lockedLecture;
          else if (section.type === SectionType.Tutorial) isLocked = !!selection.lockedTutorial;
          else if (section.type === SectionType.Lab) isLocked = !!selection.lockedLab;
        }

        for (const session of section.sessions) {
          rawItems.push({
            id: section.id, // NOTE: Multiple sessions share this ID. This is bad for dnd-kit draggable ID!
            // Dragging one session should drag the whole section conceptually?
            // If I reuse ID, dnd-kit will pick the first one.
            // I should make ID unique per session: `${section.id}-${day}-${start}`
            // But dragging *any* session should identify the section.
            // Let's attach unique key to draggable, but data points to real section ID.

            name: course.code,
            courseName: course.name,
            type: section.type,
            day: session.day,
            start: session.startHour,
            end: session.endHour,
            color: getColorForCourse(course.code),
            isMTHS: course.isMTHS,
            isLocked,
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
      className="bg-[--bg-primary] rounded-xl shadow-sm border overflow-hidden flex flex-col h-full transition-colors border-[--border-primary]"
    >
      <div className="flex-1 overflow-y-auto overflow-x-auto schedule-scroll relative">
        <div className="min-w-[800px]">
          {/* Days Header - sticky at top */}
          <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-[--border-primary] bg-[--bg-secondary] sticky top-0 z-20">
            <div className="p-3 text-xs font-medium text-[--text-muted] text-center border-r border-[--border-primary]">Time</div>
            {DAYS.map(day => (
              <div key={day} className="p-3 text-sm font-semibold text-[--text-primary] text-center border-r border-[--border-primary] last:border-0">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr_1fr] min-h-[800px]">
            {/* Time Labels */}
            <div className="border-r border-[--border-primary] bg-[--bg-secondary]">
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-[--border-primary]/50 text-xs text-[--text-muted] p-1 text-center relative">
                  <span className="absolute -top-2 left-0 right-0 font-medium">{hour}:00</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map(day => (
              <div key={day} className="relative border-r border-[--border-primary] last:border-0">
                {/* Grid lines */}
                {HOURS.map(hour => (
                  <div key={hour} className="h-16 border-b border-[--border-primary]/30"></div>
                ))}

                {/* Render User Events */}
                {renderItems.filter((item) => item.day === day).map((item) => {
                  const top = (item.start - 8) * 64;
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
                      onMobileTap={isMobile && !item.isMTHS ? () => setMobileRescheduleItem(item) : undefined}
                      onToggleLock={onToggleLock ? () => onToggleLock(item.name, item.type) : undefined}
                    />
                  );
                })}

                {/* Render Candidate Slots (Overlays) - Grouped to avoid overlap */}
                {(() => {
                  // Group candidates for this day by time slot
                  const dayCandidates = candidateSections.filter(c => c.day === day);
                  const slotMap: Map<string, CandidateItem[]> = new Map();

                  dayCandidates.forEach(c => {
                    const key = `${c.start}-${c.end}`;
                    if (!slotMap.has(key)) {
                      slotMap.set(key, []);
                    }
                    slotMap.get(key)!.push(c);
                  });

                  // Render each slot with proper width distribution
                  const elements: React.ReactElement[] = [];
                  slotMap.forEach((items) => {
                    const itemCount = items.length;
                    items.forEach((c, idx) => {
                      const top = (c.start - 8) * 64;
                      const height = (c.end - c.start) * 64;
                      const widthPercent = 100 / itemCount;
                      const leftPercent = widthPercent * idx;

                      elements.push(
                        <DroppableCandidate
                          key={c.id}
                          item={c}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        />
                      );
                    });
                  });
                  return elements;
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Tap to reschedule hint */}
        {isMobile && selections.length > 0 && (
          <div className="md:hidden mt-2 p-2.5 bg-[--bg-tertiary] rounded-xl border border-[--border-primary] text-xs text-[--text-secondary] flex items-center gap-2">
            <Clock size={14} />
            <span>Tap any course on the grid to change its time</span>
          </div>
        )}

        {/* Mobile Reschedule Modal */}
        {mobileRescheduleItem && mobileRescheduleSelection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[--bg-primary] rounded-2xl shadow-2xl w-full max-w-sm border border-[--border-primary]">
              <div className="p-4 border-b border-[--border-primary]">
                <h3 className="font-bold text-lg text-[--text-primary]">{mobileRescheduleItem.name}</h3>
                <p className="text-sm text-[--text-tertiary]">{mobileRescheduleItem.courseName}</p>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-[--text-secondary]">
                  Change {mobileRescheduleItem.type.toLowerCase()} time:
                </p>

                {/* Section selector dropdown */}
                {mobileRescheduleItem.type === 'Lecture' && (
                  <select
                    value={mobileRescheduleSelection.selectedLectureId || ''}
                    onChange={(e) => {
                      if (onUpdateSelection) {
                        onUpdateSelection({ ...mobileRescheduleSelection, selectedLectureId: e.target.value });
                        setMobileRescheduleItem(null);
                      }
                    }}
                    className="w-full p-3 border border-[--border-secondary] rounded-xl bg-[--bg-primary] text-[--text-primary] text-sm focus:ring-2 focus:ring-[--text-primary]/20 outline-none"
                  >
                    {mobileRescheduleSelection.course.sections
                      .filter(s => s.type === SectionType.Lecture)
                      .map(section => (
                        <option key={section.id} value={section.id}>
                          Group {section.group}: {section.sessions.map(s => `${s.day.substring(0, 3)} ${s.startString}-${s.endString}`).join(', ')}
                        </option>
                      ))}
                  </select>
                )}

                {mobileRescheduleItem.type === 'Tutorial' && (
                  <select
                    value={mobileRescheduleSelection.selectedTutorialId || ''}
                    onChange={(e) => {
                      if (onUpdateSelection) {
                        onUpdateSelection({ ...mobileRescheduleSelection, selectedTutorialId: e.target.value });
                        setMobileRescheduleItem(null);
                      }
                    }}
                    className="w-full p-3 border border-[--border-secondary] rounded-xl bg-[--bg-primary] text-[--text-primary] text-sm focus:ring-2 focus:ring-[--text-primary]/20 outline-none"
                  >
                    {mobileRescheduleSelection.course.sections
                      .filter(s => s.type === SectionType.Tutorial)
                      .map(section => (
                        <option key={section.id} value={section.id}>
                          Group {section.group}: {section.sessions.map(s => `${s.day.substring(0, 3)} ${s.startString}-${s.endString}`).join(', ')}
                        </option>
                      ))}
                  </select>
                )}

                {mobileRescheduleItem.type === 'Laboratory' && (
                  <select
                    value={mobileRescheduleSelection.selectedLabId || ''}
                    onChange={(e) => {
                      if (onUpdateSelection) {
                        onUpdateSelection({ ...mobileRescheduleSelection, selectedLabId: e.target.value });
                        setMobileRescheduleItem(null);
                      }
                    }}
                    className="w-full p-3 border border-[--border-secondary] rounded-xl bg-[--bg-primary] text-[--text-primary] text-sm focus:ring-2 focus:ring-[--text-primary]/20 outline-none"
                  >
                    {mobileRescheduleSelection.course.sections
                      .filter(s => s.type === SectionType.Lab)
                      .map(section => (
                        <option key={section.id} value={section.id}>
                          Group {section.group}: {section.sessions.map(s => `${s.day.substring(0, 3)} ${s.startString}-${s.endString}`).join(', ')}
                        </option>
                      ))}
                  </select>
                )}

                <button
                  onClick={() => setMobileRescheduleItem(null)}
                  className="w-full bg-[--bg-tertiary] hover:bg-[--border-secondary] text-[--text-primary] py-2.5 px-4 rounded-xl font-semibold mt-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const formatTime = (decimal: number) => {
  let h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12; // Convert 0 to 12 for midnight, 13+ to 1-11
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
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

