import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COURSES } from './data';
import { CourseSelection } from './types';
import CourseCard from './components/CourseCard';
import ScheduleGrid from './components/ScheduleGrid';
import { Search, Calendar, PlusCircle, ChevronDown, X } from 'lucide-react';

const App: React.FC = () => {
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter available courses to add (exclude already selected)
  const availableCourses = useMemo(() => {
    const selectedCodes = new Set(selections.map(s => s.course.code));
    return COURSES.filter(c => 
      !selectedCodes.has(c.code) && 
      (c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [selections, searchTerm]);

  const addCourse = (courseCode: string) => {
    const course = COURSES.find(c => c.code === courseCode);
    if (!course) return;
    setSelections([...selections, { course }]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const removeCourse = (courseCode: string) => {
    setSelections(selections.filter(s => s.course.code !== courseCode));
  };

  const updateSelection = (updated: CourseSelection) => {
    setSelections(selections.map(s => s.course.code === updated.course.code ? updated : s));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar - Course Management */}
      <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col relative shadow-xl z-20`}>
        <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="absolute -right-8 top-4 bg-white p-1 rounded-r-md border border-l-0 border-slate-200 shadow-sm text-slate-500 hover:text-blue-600"
        >
          {isSidebarOpen ? '◄' : '►'}
        </button>

        <div className={`flex flex-col h-full ${!isSidebarOpen && 'hidden'}`}>
           <div className="p-6 border-b border-slate-100">
             <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Calendar className="text-blue-600" />
               Spring 2026
             </h1>
             <p className="text-xs text-slate-400 mt-1">Schedule Planner</p>
           </div>

           {/* Add Course Search */}
           <div className="p-4 border-b border-slate-100 bg-slate-50">
             <div className="relative" ref={searchContainerRef}>
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search course code or name..."
                 className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 value={searchTerm}
                 onChange={(e) => {
                     setSearchTerm(e.target.value);
                     setIsDropdownOpen(true);
                 }}
                 onFocus={() => setIsDropdownOpen(true)}
                 onClick={() => setIsDropdownOpen(true)}
               />
               
               {searchTerm ? (
                 <button 
                    onClick={() => {
                        setSearchTerm('');
                        setIsDropdownOpen(true);
                    }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-1"
                 >
                   <X size={14} />
                 </button>
               ) : (
                 <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={14} />
               )}

               {isDropdownOpen && (
                 <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                   {availableCourses.length === 0 ? (
                     <div className="p-3 text-xs text-slate-400 text-center">No courses found</div>
                   ) : (
                     availableCourses.map(course => (
                       <button 
                         key={course.code}
                         onClick={() => addCourse(course.code)}
                         className="w-full text-left p-2 hover:bg-blue-50 text-sm flex justify-between items-center group border-b border-slate-50 last:border-0"
                       >
                         <div className="flex-1 min-w-0">
                           <span className="font-bold text-slate-700 block">{course.code}</span>
                           <span className="text-xs text-slate-500 block truncate">{course.name}</span>
                         </div>
                         <PlusCircle size={16} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                       </button>
                     ))
                   )}
                 </div>
               )}
             </div>
           </div>

           {/* Selected Courses List */}
           <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
             <div className="flex justify-between items-center mb-3">
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Selections</h2>
               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{selections.length}</span>
             </div>
             
             {selections.length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">
                 No courses selected yet. <br/> Use the search bar to add courses.
               </div>
             ) : (
               selections.map(selection => (
                 <CourseCard 
                   key={selection.course.code} 
                   selection={selection}
                   allSelections={selections}
                   onRemove={() => removeCourse(selection.course.code)}
                   onUpdate={updateSelection}
                 />
               ))
             )}
           </div>
           
           <div className="p-4 border-t border-slate-200 bg-white text-xs text-slate-400 text-center">
             Supports MTHS group constraints & conflict detection.
           </div>
        </div>
      </div>

      {/* Main Content - Schedule Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
           <ScheduleGrid selections={selections} />
        </div>
      </div>
    </div>
  );
};

export default App;