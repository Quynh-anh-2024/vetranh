import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { GeneratorPanel } from './components/GeneratorPanel';
import { GalleryGrid } from './components/GalleryGrid';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Topic, Lesson } from './types';
import { Menu, Palette, Image as ImageIcon, PlusCircle } from 'lucide-react';

type Tab = 'create' | 'repository';

const App: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('repository'); // Default Repository
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers
  const handleSelectGrade = (g: number) => {
    setSelectedGrade(g);
    setSelectedTopic(null);
    setSelectedLesson(null);
  };

  const handleSelectTopic = (t: Topic) => {
    if (selectedTopic?.id === t.id) {
       setSelectedTopic(null);
    } else {
       setSelectedTopic(t);
    }
  };

  const handleSelectLesson = (l: Lesson) => {
    setSelectedLesson(l);
    setActiveTab('create'); 
    setShowMobileSidebar(false);
  };

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden text-gray-800 font-sans">
      <PWAInstallPrompt />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onKeyUpdate={() => window.dispatchEvent(new Event('storage'))} // Trigger updates
      />

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar (Always mounted to keep state, hidden on mobile) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          selectedGrade={selectedGrade}
          onSelectGrade={handleSelectGrade}
          selectedTopic={selectedTopic}
          onSelectTopic={handleSelectTopic}
          selectedLesson={selectedLesson}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#FFFDF9]">
        
        {/* Header */}
        <Header 
          onHome={() => {
            setSelectedGrade(null);
            setSelectedLesson(null);
            setActiveTab('repository');
          }}
          title={selectedLesson ? selectedLesson.name : undefined}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Mobile Header Sub-bar (for Menu) */}
        <div className="md:hidden p-2 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm px-4">
           <span className="text-xs font-bold text-gray-400">
             {selectedGrade ? `Lớp ${selectedGrade}` : 'Menu'}
           </span>
           <button onClick={() => setShowMobileSidebar(true)} className="p-2 text-gray-600 bg-gray-50 rounded-lg">
             <Menu size={20} />
           </button>
        </div>

        {/* Tab Nav */}
        <div className="bg-white border-b border-gray-100 px-4 pt-2 shadow-sm z-20">
           <div className="flex gap-8 max-w-4xl mx-auto">
              <button 
                onClick={() => setActiveTab('repository')}
                className={`py-4 font-bold text-sm md:text-base flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'repository' 
                    ? 'border-kid-blue text-kid-blue' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <ImageIcon size={20} /> Kho Lưu Trữ
              </button>
              <button 
                onClick={() => setActiveTab('create')}
                className={`py-4 font-bold text-sm md:text-base flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'create' 
                    ? 'border-kid-pink text-kid-pink' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <PlusCircle size={20} /> Tạo Tranh Mới
              </button>
           </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-20">
            
            {/* VIEW: REPOSITORY */}
            {activeTab === 'repository' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                   <div className="bg-blue-50 p-3 rounded-2xl">
                      <ImageIcon className="text-kid-blue w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-800">Kho Tranh</h2>
                      <p className="text-sm text-gray-500">Khám phá các tác phẩm từ cộng đồng và của bé</p>
                   </div>
                </div>
                <GalleryGrid 
                   grade={selectedGrade} 
                   lesson={selectedLesson} 
                   defaultTab="community"
                />
              </div>
            )}

            {/* VIEW: CREATE */}
            {activeTab === 'create' && (
              <>
                {!selectedLesson ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                     <div className="relative">
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <img src="https://api.iconify.design/noto:artist-palette.svg" className="w-32 h-32 relative z-10 animate-float" alt="Art" />
                     </div>
                     <div className="max-w-md px-4">
                       <h2 className="text-2xl font-black text-gray-700 mb-2">Bé muốn vẽ gì hôm nay?</h2>
                       <p className="text-gray-500 mb-6">Chọn một bài học từ menu bên trái (hoặc bấm nút dưới trên điện thoại) để bắt đầu sáng tạo nhé!</p>
                       <button 
                         onClick={() => setShowMobileSidebar(true)}
                         className="md:hidden px-8 py-4 bg-kid-blue text-white rounded-2xl font-bold shadow-lg shadow-blue-200 animate-bounce-subtle"
                       >
                         Mở danh sách bài học
                       </button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <GeneratorPanel 
                        grade={selectedGrade!}
                        topic={selectedTopic!}
                        lesson={selectedLesson}
                        onSuccess={() => setActiveTab('repository')} 
                     />
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;