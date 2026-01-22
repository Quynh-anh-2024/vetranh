import React from 'react';
import { VietnameseIdea } from '../types';
import { Edit3, CheckCircle2, Image, Users, Mountain, Smile, BookOpen, PenTool } from 'lucide-react';

interface IdeaSelectorProps {
  ideas: VietnameseIdea[];
  selectedId: string | null;
  onSelect: (idea: VietnameseIdea) => void;
  customInput: string;
  onCustomInputChange: (val: string) => void;
}

// Map idea types to icons
const getIconForIdea = (name: string, index: number) => {
  const n = name.toLowerCase();
  if (n.includes('chân dung') || n.includes('người')) return <Smile className="w-6 h-6 text-orange-500" />;
  if (n.includes('phong cảnh') || n.includes('cảnh')) return <Mountain className="w-6 h-6 text-green-500" />;
  if (n.includes('nhóm') || n.includes('gia đình')) return <Users className="w-6 h-6 text-blue-500" />;
  if (n.includes('tô màu') || n.includes('nét')) return <PenTool className="w-6 h-6 text-gray-600" />;
  if (n.includes('minh họa') || n.includes('tranh')) return <Image className="w-6 h-6 text-purple-500" />;
  return <BookOpen className="w-6 h-6 text-pink-500" />;
};

export const IdeaSelector: React.FC<IdeaSelectorProps> = ({
  ideas,
  selectedId,
  onSelect,
  customInput,
  onCustomInputChange
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ideas.map((idea, index) => {
          const isSelected = selectedId === idea.id;
          return (
            <button
              key={idea.id}
              onClick={() => onSelect(idea)}
              className={`
                relative p-4 rounded-2xl border-2 text-left transition-all duration-200 group
                ${isSelected 
                  ? 'border-kid-blue bg-blue-50 shadow-md ring-2 ring-blue-100 ring-offset-1' 
                  : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-3 rounded-xl flex-shrink-0 transition-colors
                  ${isSelected ? 'bg-white' : 'bg-gray-100 group-hover:bg-white'}
                `}>
                  {getIconForIdea(idea.name, index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                      {idea.name}
                    </h4>
                    {isSelected && <CheckCircle2 size={18} className="text-kid-blue animate-bounce-subtle" />}
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {idea.composition} • {idea.details}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`
                      px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${idea.level === 'Thấp' ? 'bg-green-100 text-green-700' :
                        idea.level === 'Vừa' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}
                    `}>
                      Chi tiết: {idea.level}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Input Area */}
      <div className={`
        relative p-1 rounded-2xl transition-all duration-300
        ${customInput ? 'bg-gradient-to-r from-kid-blue via-kid-purple to-kid-pink p-[2px]' : 'bg-gray-100'}
      `}>
        <div className="bg-white rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap px-2">
             <Edit3 size={18} className="text-kid-purple" />
             <span className="text-sm font-bold text-gray-700">Tùy chỉnh thêm:</span>
          </div>
          <input 
            type="text" 
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="Ví dụ: Thêm ông mặt trời, đổi áo màu đỏ..."
            className="flex-1 w-full bg-transparent border-b-2 border-gray-100 px-2 py-1 text-sm font-medium focus:outline-none focus:border-kid-blue transition-colors placeholder:font-normal placeholder:italic"
          />
        </div>
      </div>
    </div>
  );
};