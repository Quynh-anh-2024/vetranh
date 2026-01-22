import React from 'react';

interface FooterProps {
  grade: number | null;
}

export const Footer: React.FC<FooterProps> = ({ grade }) => {
  // Map grade to theme colors (Gradient Accent)
  const getTheme = (g: number | null) => {
    switch (g) {
      case 1: return "from-blue-500 to-indigo-500";
      case 2: return "from-emerald-500 to-green-500";
      case 3: return "from-amber-500 to-orange-500";
      case 4: return "from-violet-500 to-purple-500";
      case 5: return "from-pink-500 to-rose-500";
      default: return "from-gray-300 to-gray-400";
    }
  };

  const accentGradient = getTheme(grade);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[60] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] font-sans">
      {/* Accent Line: Changes color based on Grade */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentGradient} transition-all duration-500 ease-in-out`} />
      
      {/* Footer Content */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 px-4">
        <p className="text-center text-slate-700 text-xs md:text-sm font-bold tracking-wide leading-tight">
          Thầy Hải - Trường PTDTBT TH Giàng Chu Phìn
        </p>
      </div>
    </footer>
  );
};