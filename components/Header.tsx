import React from 'react';
import { Home, ArrowLeft, Settings } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
  onBack?: () => void;
  onOpenSettings: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onHome, onBack, onOpenSettings, title }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b-4 border-kid-yellow py-3 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft size={28} />
            </button>
          )}
          <h1 className={`text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-kid-blue to-kid-purple truncate ${!title ? 'opacity-100' : 'hidden md:block'}`}>
            Kho Ý Tưởng Nhí 🚀
          </h1>
          {title && (
            <span className="md:hidden text-lg font-bold text-gray-700 truncate max-w-[180px]">
              {title}
            </span>
          )}
        </div>

        {title && <div className="hidden md:block text-xl font-bold text-gray-700">{title}</div>}

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            title="Cài đặt API"
          >
            <Settings size={20} />
          </button>
          
          <button 
            onClick={onHome}
            className="flex items-center gap-2 px-4 py-2 bg-kid-yellow text-gray-800 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-sm"
          >
            <Home size={20} />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>
        </div>
      </div>
    </header>
  );
};