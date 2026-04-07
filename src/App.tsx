import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronRight,
  X,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Course, PlannedCourse } from './types';
import { MOCK_COURSES, DAYS, HOURS } from './constants';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const addCourse = (course: Course) => {
    // Check for duplicates
    if (plannedCourses.some(c => c.id === course.id)) return;
    
    // Check for time conflicts
    const hasConflict = course.schedules.some(newSched => 
      plannedCourses.some(existingCourse => 
        existingCourse.schedules.some(existingSched => {
          if (newSched.day !== existingSched.day) return false;
          const newStart = parseInt(newSched.start.replace(':', ''));
          const newEnd = parseInt(newSched.end.replace(':', ''));
          const existingStart = parseInt(existingSched.start.replace(':', ''));
          const existingEnd = parseInt(existingSched.end.replace(':', ''));
          
          return (newStart < existingEnd && newEnd > existingStart);
        })
      )
    );

    if (hasConflict) {
      alert(`Time conflict detected for ${course.code}!`);
      return;
    }

    setPlannedCourses([...plannedCourses, { ...course, instanceId: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeCourse = (instanceId: string) => {
    setPlannedCourses(plannedCourses.filter(c => c.instanceId !== instanceId));
  };

  const handleAiAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);
    
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `You are an academic advisor. A student is asking: "${chatInput}". 
      Current planned courses: ${plannedCourses.map(c => `${c.code}: ${c.name}`).join(', ')}.
      Available courses in our catalog: ${MOCK_COURSES.map(c => `${c.code}: ${c.name} (${c.description})`).join('; ')}.
      Provide helpful, concise advice on their course selection, potential workload, or suggestions for what to take next.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setAiResponse(response.text || "I couldn't generate a response. Please try again.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Sorry, I encountered an error while thinking. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const totalCredits = plannedCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">EduPlan</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Course Registration Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Credits</span>
            <span className={cn(
              "text-lg font-bold",
              totalCredits > 18 ? "text-orange-600" : "text-blue-600"
            )}>
              {totalCredits} / 18
            </span>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
            Finalize Registration
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Sidebar: Course Search */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search size={14} /> Course Catalog
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search code, name..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredCourses.map(course => (
                <motion.div 
                  layout
                  key={course.id}
                  className="group p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 uppercase">
                      {course.code}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addCourse(course);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><User size={12} /> {course.instructor}</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">{course.credits} Cr</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-blue-200 overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Sparkles size={120} />
            </div>
            <h2 className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={14} /> AI Academic Advisor
            </h2>
            <form onSubmit={handleAiAdvice} className="relative">
              <textarea 
                placeholder="Ask for course suggestions..." 
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm placeholder:text-blue-200 focus:outline-none focus:bg-white/20 transition-all resize-none h-24"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isAiLoading}
                className="absolute right-2 bottom-2 p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <ChevronRight size={20} />}
              </button>
            </form>
            
            <AnimatePresence>
              {aiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-white/10 rounded-xl text-xs leading-relaxed max-h-40 overflow-y-auto custom-scrollbar"
                >
                  <div className="prose prose-invert prose-sm">
                    <Markdown>
                      {aiResponse}
                    </Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Schedule Grid */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <CalendarIcon size={16} /> Weekly Schedule
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Planned
                </div>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Grid Header */}
                <div className="grid grid-cols-6 border-b border-slate-100">
                  <div className="p-2 border-r border-slate-100" />
                  {DAYS.map(day => (
                    <div key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid Body */}
                <div className="relative h-[650px]">
                  {/* Hour Lines */}
                  {HOURS.map((hour, i) => (
                    <div 
                      key={hour} 
                      className="absolute w-full border-b border-slate-50 flex items-start"
                      style={{ top: `${(i / HOURS.length) * 100}%`, height: `${(1 / HOURS.length) * 100}%` }}
                    >
                      <div className="w-[16.66%] -mt-2.5 pr-3 text-right text-[10px] font-bold text-slate-400 tabular-nums">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                      </div>
                      <div className="flex-1 grid grid-cols-5 h-full">
                        {DAYS.map((_, idx) => (
                          <div key={idx} className="border-r border-slate-50 last:border-r-0" />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Course Blocks */}
                  {plannedCourses.map(course => (
                    course.schedules.map((sched, idx) => {
                      const dayIndex = DAYS.indexOf(sched.day);
                      const startHour = parseInt(sched.start.split(':')[0]);
                      const startMin = parseInt(sched.start.split(':')[1]);
                      const endHour = parseInt(sched.end.split(':')[0]);
                      const endMin = parseInt(sched.end.split(':')[1]);

                      const startOffset = ((startHour - HOURS[0]) + (startMin / 60)) / HOURS.length;
                      const duration = ((endHour - startHour) + (endMin - startMin) / 60) / HOURS.length;

                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={`${course.instanceId}-${idx}`}
                          className={cn(
                            "absolute rounded-lg p-2 border shadow-sm flex flex-col justify-between overflow-hidden group cursor-pointer z-10",
                            course.color
                          )}
                          style={{
                            left: `${(dayIndex + 1) * 16.66 + 0.5}%`,
                            top: `${startOffset * 100 + 0.5}%`,
                            width: '15.66%',
                            height: `${duration * 100 - 1}%`
                          }}
                          onClick={() => setSelectedCourse(course)}
                        >
                          <div>
                            <p className="text-[9px] font-black uppercase opacity-70 mb-0.5">{course.code}</p>
                            <p className="text-[11px] font-bold leading-tight line-clamp-2">{course.name}</p>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-[9px] font-bold opacity-70">{sched.start} - {sched.end}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCourse(course.instanceId);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Summary & Details */}
        <div className="col-span-12 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} /> Planned
            </h2>
            <div className="space-y-3">
              {plannedCourses.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <CalendarIcon size={20} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">No courses added yet</p>
                </div>
              ) : (
                plannedCourses.map(course => (
                  <div key={course.instanceId} className="flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">{course.code}</span>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{course.name}</span>
                    </div>
                    <button 
                      onClick={() => removeCourse(course.instanceId)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {plannedCourses.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400 font-medium">Courses</span>
                  <span className="text-slate-700 font-bold">{plannedCourses.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Credits</span>
                  <span className="text-slate-700 font-bold">{totalCredits}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Tips</h2>
            <ul className="space-y-3">
              <li className="flex gap-2 text-[11px] text-slate-300 leading-relaxed">
                <AlertCircle size={14} className="text-blue-400 shrink-0" />
                Aim for 12-15 credits for a balanced workload.
              </li>
              <li className="flex gap-2 text-[11px] text-slate-300 leading-relaxed">
                <Clock size={14} className="text-blue-400 shrink-0" />
                Leave gaps for lunch and study sessions.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={cn("h-32 p-8 flex flex-col justify-end", selectedCourse.color.split(' ')[0])}>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <span className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{selectedCourse.code}</span>
                <h3 className="text-2xl font-bold leading-tight">{selectedCourse.name}</h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <User size={14} className="text-blue-500" /> {selectedCourse.instructor}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-blue-500" /> {selectedCourse.credits} Units
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                    <span className="text-sm font-bold text-slate-700">{selectedCourse.department}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Schedule</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.schedules.map((s, i) => (
                      <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Clock size={12} className="text-blue-500" /> {s.day} {s.start} - {s.end}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    addCourse(selectedCourse);
                    setSelectedCourse(null);
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add to Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
