import React, { useEffect, useState } from 'react';
import { ArtWork, Lesson, GRADE_THEMES, GRADE_COLORS } from '../types';
import { subscribeToGallery, getCurrentUser, deleteArtwork, toggleArtworkVisibility } from '../services/firebase.ts';
import { Download, Search, Trash2, Globe, Lock, Copy, Maximize2, X, Filter, Loader2 } from 'lucide-react';

interface GalleryGridProps {
  grade: number | null;
  lesson: Lesson | null;
  defaultTab?: 'community' | 'mine';
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ grade, lesson, defaultTab = 'community' }) => {
  const [artworks, setArtworks] = useState<ArtWork[]>([]);
  const [activeTab, setActiveTab] = useState<'community' | 'mine'>(defaultTab);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [selectedArt, setSelectedArt] = useState<ArtWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local Filters
  const [filterGrade, setFilterGrade] = useState<number | null>(grade);
  const [filterStyle, setFilterStyle] = useState<string>('');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    // Sync props to state if they change from parent
    if (grade) setFilterGrade(grade);
  }, [grade]);

  useEffect(() => {
    setIsLoading(true);
    const userId = currentUser ? currentUser.uid : null;
    const unsubscribe = subscribeToGallery(
      activeTab, 
      userId, 
      { grade: filterGrade, lesson: lesson?.name, style: filterStyle || null, search },
      (data) => {
        setArtworks(data);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [activeTab, currentUser, filterGrade, filterStyle, search, lesson]);

  const handleDelete = async (e: React.MouseEvent, art: ArtWork) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc muốn xóa tranh này không?")) {
      await deleteArtwork(art.id);
      if (selectedArt?.id === art.id) setSelectedArt(null);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, art: ArtWork) => {
    e.stopPropagation();
    try {
      await toggleArtworkVisibility(art.id, art.visibility);
    } catch (err) {
      alert("Lỗi kết nối.");
    }
  };

  const handleCopyPrompt = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    alert("Đã sao chép prompt!");
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'community' ? 'bg-white text-kid-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kho Cộng Đồng
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'mine' ? 'bg-white text-kid-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kho Của Tôi
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 flex-1 justify-end">
           <select 
            value={filterGrade || ''}
            onChange={(e) => setFilterGrade(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-kid-blue"
          >
            <option value="">Tất cả lớp</option>
            {[1,2,3,4,5].map(g => <option key={g} value={g}>Lớp {g}</option>)}
          </select>

          <select 
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-kid-blue"
          >
            <option value="">Tất cả Style</option>
            <option value="Watercolor">Màu nước</option>
            <option value="Crayon">Sáp màu</option>
            <option value="3D Cartoon">3D</option>
            <option value="Pencil Sketch">Chì</option>
          </select>

          <div className="relative w-full md:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm tên bài, chủ đề..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-kid-blue"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
         <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-kid-blue" size={40} />
         </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Filter className="text-gray-300" size={32} />
           </div>
           <p className="text-gray-400 font-medium">Chưa có tranh nào phù hợp.</p>
           {activeTab === 'mine' && <p className="text-sm text-kid-blue mt-2">Hãy tạo bức tranh đầu tiên!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fadeIn">
          {artworks.map(art => (
            <div 
              key={art.id} 
              onClick={() => setSelectedArt(art)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img src={art.imagePreviewBase64} alt={art.lessonName} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                
                {/* Style Badge */}
                <div className="absolute top-2 left-2">
                   <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm">
                      {art.style}
                   </span>
                </div>

                {/* Visibility Badge (Owner) */}
                {activeTab === 'mine' && (
                   <div className="absolute top-2 right-2">
                      {art.visibility === 'private' ? (
                        <div className="p-1.5 bg-gray-800/80 text-white rounded-lg backdrop-blur-md"><Lock size={12}/></div>
                      ) : (
                        <div className="p-1.5 bg-green-500/80 text-white rounded-lg backdrop-blur-md"><Globe size={12}/></div>
                      )}
                   </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className={`text-[10px] font-bold uppercase mb-1 px-2 py-0.5 rounded w-fit ${GRADE_COLORS[art.grade] || 'bg-gray-100 text-gray-500'}`}>
                  Lớp {art.grade}
                </div>
                <h4 className="font-bold text-sm text-gray-800 truncate" title={art.lessonName}>{art.lessonName}</h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">{art.topicName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedArt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedArt(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex-1 bg-gray-100 flex items-center justify-center relative bg-pattern p-4">
              <img src={selectedArt.imagePreviewBase64} className="max-w-full max-h-[40vh] md:max-h-full object-contain rounded-lg shadow-lg" alt="Full" />
            </div>

            <div className="w-full md:w-80 bg-white p-6 flex flex-col border-l border-gray-100 overflow-y-auto">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h2 className="text-lg font-bold text-gray-800 leading-tight mb-1">{selectedArt.lessonName}</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${GRADE_COLORS[selectedArt.grade]}`}>
                       Lớp {selectedArt.grade}
                    </span>
                 </div>
                 <button onClick={() => setSelectedArt(null)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                 </button>
               </div>

               <div className="space-y-4">
                 {selectedArt.promptTextVN && (
                   <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <span className="text-xs font-bold text-orange-400 uppercase">Ý tưởng (VN)</span>
                      <p className="text-sm text-gray-700 mt-1">{selectedArt.promptTextVN}</p>
                   </div>
                 )}
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                    <span className="text-xs font-bold text-gray-400 uppercase">Prompt (EN)</span>
                    <p className="text-sm text-gray-600 italic line-clamp-6 mt-1">{selectedArt.promptTextEN}</p>
                    <button onClick={(e) => handleCopyPrompt(e, selectedArt.promptTextEN)} className="absolute top-2 right-2 p-1 bg-white shadow rounded hover:text-blue-500"><Copy size={14}/></button>
                 </div>
               </div>

               <div className="mt-auto pt-6 space-y-3">
                 <a 
                   href={selectedArt.imagePreviewBase64} 
                   download={`art_grade${selectedArt.grade}_${Date.now()}.jpg`}
                   className="w-full py-3 bg-kid-blue text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 shadow-lg transition-all"
                 >
                   <Download size={18} /> Tải ảnh về
                 </a>

                 {activeTab === 'mine' && (
                   <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleToggleVisibility(e, selectedArt)}
                        className="flex-1 py-2 border rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-50"
                      >
                         {selectedArt.visibility === 'public' ? <><Globe size={14}/> Public</> : <><Lock size={14}/> Private</>}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, selectedArt)}
                        className="flex-1 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-100"
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};