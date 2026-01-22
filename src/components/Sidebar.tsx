import React from 'react';
import { GradeLevel, Topic, Lesson, GRADE_COLORS } from '../types';
import { CURRICULUM } from '../data/curriculum';
import { ChevronDown, ChevronRight, Book, GraduationCap, Palette } from 'lucide-react';

interface SidebarProps {
  selectedGrade: number | null;
  onSelectGrade: (g: number) => void;
  selectedTopic: Topic | null;
  onSelectTopic: (t: Topic) => void;
  selectedLesson: Lesson | null;
  onSelectLesson: (l: Lesson) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedGrade, onSelectGrade, selectedTopic, onSelectTopic, selectedLesson, onSelectLesson
}) => {
  return (
    <div className="w-full md:w-72 bg-white h-full border-r border-gray-100 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-kid-blue to-kid-purple">
             Xưởng Vẽ Nhí
          </span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Kết nối tri thức với cuộc sống</p>
      </div>

      {/* Grade Selector */}
      <div className="p-4 grid grid-cols-5 gap-2 border-b border-gray-50">
        {[1, 2, 3, 4, 5].map(g => (
          <button
            key={g}
            onClick={() => onSelectGrade(g)}
            className={`aspect-square rounded-xl font-bold flex items-center justify-center transition-all border-2 ${
              selectedGrade === g 
                ? `${GRADE_COLORS[g]} shadow-md scale-105` 
                : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Curriculum Tree */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {!selectedGrade ? (
          <div className="text-center p-8 text-gray-400 mt-10">
            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">Chọn lớp để xem bài học</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {CURRICULUM[selectedGrade]?.topics.map(topic => (
              <div key={topic.id} className="rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => onSelectTopic(topic)}
                  className={`w-full text-left p-3 flex items-start gap-3 rounded-xl transition-colors ${
                    selectedTopic?.id === topic.id 
                      ? `${GRADE_COLORS[selectedGrade]} bg-opacity-10 border border-opacity-20` 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-md ${selectedTopic?.id === topic.id ? 'bg-white bg-opacity-50' : 'bg-gray-100'}`}>
                    {selectedTopic?.id === topic.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold opacity-70 uppercase block tracking-wider">Chủ đề {topic.no}</span>
                    <span className="font-bold text-sm leading-tight block mt-0.5">{topic.name}</span>
                  </div>
                </button>

                {selectedTopic?.id === topic.id && (
                  <div className="pl-4 pr-1 py-2 space-y-1 relative ml-3 border-l-2 border-dashed border-gray-100">
                    {topic.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`w-full text-left p-2.5 rounded-xl text-sm flex items-center gap-2 transition-all ${
                          selectedLesson?.id === lesson.id 
                            ? 'bg-white shadow-md text-gray-800 font-bold ring-1 ring-black/5' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Book size={14} className={selectedLesson?.id === lesson.id ? 'text-kid-blue' : 'text-gray-300'} />
                        <span className="truncate">{lesson.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};