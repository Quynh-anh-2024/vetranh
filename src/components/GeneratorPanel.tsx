import React, { useState, useEffect } from 'react';
import { Lesson, Topic, VietnameseIdea, ArtDraftState } from '../types';
import { generateImageBlob } from '../services/geminiService';
import { translateVnToEnPrompt } from '../services/translateService';
import { getIdeasForLesson } from '../data/sampleIdeas';
import { saveArtwork, signInUser, checkFirebaseStatus } from '../services/firebase'; // Đã bỏ đuôi .ts
import { compressImageToBase64 } from '../utils/imageUtils';
import { Wand2, Save, Loader2, Image as ImageIcon, Download, Copy, Edit, Check, ExternalLink, Palette, PenTool, AlertTriangle } from 'lucide-react';
import { StyleSelector, ArtStyle } from './StyleSelector';
import { IdeaSelector } from './IdeaSelectionTable';
// import { SettingsModal } from './SettingsModal'; // Có thể bỏ nếu không dùng

interface GeneratorPanelProps {
  grade: number;
  topic: Topic;
  lesson: Lesson;
  onSuccess?: () => void;
}

const DRAFT_KEY = "artconnect:lastDraft";
const STORAGE_KEY = 'artconnect:apiKey';

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ grade, topic, lesson, onSuccess }) => {
  // Config State
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Style & Prompts
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('Watercolor');
  const [ideas, setIdeas] = useState<VietnameseIdea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [customVnInput, setCustomVnInput] = useState('');
  const [enPrompt, setEnPrompt] = useState<string>('');
  
  // UI States
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEnEditable, setIsEnEditable] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang vẽ...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  
  // Result
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null);

  // --- PHẦN QUAN TRỌNG ĐÃ SỬA ---
  // Tự động lấy API Key từ Netlify (Biến môi trường) hoặc LocalStorage
  useEffect(() => {
    const checkKey = () => {
      // 1. Lấy từ LocalStorage (Ưu tiên nếu người dùng muốn dùng key riêng)
      const userKey = localStorage.getItem(STORAGE_KEY);
      
      // 2. Lấy từ Biến môi trường Netlify (Đây là cái bạn vừa cài đặt)
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;

      // 3. Quyết định dùng key nào (Ưu tiên User Key nếu có, không thì dùng Env Key)
      const finalKey = userKey || envKey;

      setApiKey(finalKey);
      
      // Nếu đã có key rồi thì ẩn cảnh báo đi
      if (finalKey) setShowSettingsHint(false);
      
      // Log nhẹ để debug (bạn có thể xóa sau này)
      if (!finalKey) {
          console.warn("Chưa tìm thấy API Key nào (cả LocalStorage lẫn Env).");
      } else {
          console.log("Đã tải API Key thành công.");
      }
    };
    
    checkKey();
    
    window.addEventListener('storage', checkKey);
    // Poll nhẹ để check nếu user cập nhật key ở tab khác
    const interval = setInterval(checkKey, 2000);
    return () => {
      window.removeEventListener('storage', checkKey);
      clearInterval(interval);
    }
  }, []);
  // ---------------------------------

  // Restore Draft
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft: ArtDraftState = JSON.parse(savedDraft);
        if (draft.lessonId === lesson.id) {
          setPreviewUrl(draft.previewBase64);
          setEnPrompt(draft.promptTextEN);
          setCustomVnInput(draft.promptTextVN);
          setSelectedStyle(draft.style as ArtStyle);
          setIsSaved(draft.isSaved);
          setSavedDocId(draft.savedDocId);
          if (draft.previewBase64) {
            fetch(draft.previewBase64).then(res => res.blob()).then(blob => setGeneratedBlob(blob));
          }
        }
      } catch (e) { console.error(e); }
    }
  }, [lesson.id]);

  // Load Ideas
  useEffect(() => {
    const loadedIdeas = getIdeasForLesson(lesson.name);
    setIdeas(loadedIdeas);
    
    // Reset if new lesson and no draft
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    const draftLessonId = savedDraft ? JSON.parse(savedDraft).lessonId : null;
    
    if (draftLessonId !== lesson.id) {
      setSelectedIdeaId(null);
      setCustomVnInput('');
      setEnPrompt('');
      setPreviewUrl(null);
      setGeneratedBlob(null);
      setIsSaved(false);
      setSavedDocId(null);
    }
  }, [lesson]);

  // Persist Draft
  useEffect(() => {
    if (previewUrl || customVnInput) {
      const draft: ArtDraftState = {
        lessonId: lesson.id,
        previewBase64: previewUrl, 
        promptTextEN: enPrompt,
        promptTextVN: customVnInput,
        style: selectedStyle,
        isSaved,
        savedDocId,
        timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [previewUrl, enPrompt, customVnInput, selectedStyle, isSaved, savedDocId, lesson.id]);

  // Loading Text Cycle
  useEffect(() => {
    if (!isGeneratingImage) return;
    const messages = ["Đang phác thảo...", "Đang pha màu...", "Đang tô màu...", "Sắp xong rồi..."];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[i]);
      i = (i + 1) % messages.length;
    }, 2000);
    return () => clearInterval(interval);
  }, [isGeneratingImage]);

  // --- HANDLERS ---
  const handleSelectIdea = (idea: VietnameseIdea) => {
    setSelectedIdeaId(idea.id);
    const combinedText = `${idea.name}. ${idea.composition}. ${idea.details}. Bối cảnh: ${idea.context}.`;
    setCustomVnInput(combinedText);
    translatePrompt(combinedText, selectedStyle);
  };

  const translatePrompt = async (text: string, style: ArtStyle) => {
    if (!apiKey) return;
    setIsTranslating(true);
    try {
        const translated = await translateVnToEnPrompt({
        apiKey,
        vnText: text,
        style: style,
        grade,
        lessonName: lesson.name
        });
        setEnPrompt(translated);
    } catch (error) {
        console.error("Lỗi dịch:", error);
        setEnPrompt(text); // Fallback: dùng luôn tiếng Việt nếu dịch lỗi
    }
    setIsTranslating(false);
  };

  const handleGenerateImage = async () => {
    if (!apiKey) {
      setShowSettingsHint(true);
      alert("Chưa tìm thấy API Key. Vui lòng kiểm tra cấu hình hoặc nhập key cá nhân.");
      return;
    }
    if (!enPrompt) {
      alert("Vui lòng chọn ý tưởng để tạo nội dung trước.");
      return;
    }

    setIsGeneratingImage(true);
    setErrorMsg(null);
    setIsSaved(false);
    setSavedDocId(null);

    try {
      // Gọi service tạo ảnh
      const blob = await generateImageBlob(apiKey, enPrompt, ""); 
      if (blob) {
        setGeneratedBlob(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPreviewUrl(base64);
        };
      } else {
         throw new Error("Không nhận được dữ liệu ảnh từ AI.");
      }
    } catch (e: any) {
      console.error("Gen Error:", e);
      // Hiển thị lỗi chi tiết hơn một chút để dễ debug
      let displayError = "Lỗi khi tạo tranh. ";
      if (e.message.includes("403")) displayError += "Key không có quyền truy cập model này.";
      else if (e.message.includes("400")) displayError += "Yêu cầu không hợp lệ.";
      else displayError += "Kiểm tra kết nối hoặc API Key.";
      
      setErrorMsg(displayError);
    }
    setIsGeneratingImage(false);
  };

  const handleSaveToRepository = async () => {
    if (!generatedBlob || isSaved || !apiKey) return;
    setIsSaving(true);
    
    // 1. Check Firebase Status
    const fbStatus = checkFirebaseStatus();
    if (!fbStatus.ready) {
      alert(`Chưa cấu hình Firebase: ${fbStatus.error}. Vui lòng liên hệ Admin.`);
      setIsSaving(false);
      return;
    }

    try {
      // 2. Sign In
      const user = await signInUser();
      if (!user) throw new Error("Không thể đăng nhập ẩn danh (Auth failed)"); 

      // 3. Compress & Save
      const base64 = await compressImageToBase64(generatedBlob);
      const docId = await saveArtwork({
        imagePreviewBase64: base64,
        promptTextEN: enPrompt,
        promptTextVN: customVnInput,
        style: selectedStyle,
        lessonName: lesson.name,
        topicName: topic.name,
        grade: grade,
        userId: user.uid,
        authorName: 'AI & Bé',
        visibility: 'public',
        savedFrom: 'generator'
      });
      setIsSaved(true);
      setSavedDocId(docId);
      if (onSuccess) onSuccess(); 
    } catch (e: any) {
      console.error(e);
      if (e.message.includes("api-key-not-valid")) {
        alert("Lỗi Firebase: API Key Firebase không đúng. Hãy kiểm tra biến môi trường Netlify.");
      } else {
        alert(`Không thể lưu: ${e.message}`);
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-[32px] shadow-lg border-2 border-orange-50 p-6 md:p-8 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-pulse"></div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* LEFT: Controls */}
        <div className="flex-1 space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-kid-purple to-pink-500 p-2.5 rounded-xl shadow-lg shadow-purple-200">
                <Palette className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800">Góc Sáng Tạo</h3>
                <p className="text-sm font-medium text-gray-400">
                  Bài học: <span className="text-kid-blue font-bold">{lesson.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* STEP 1: STYLE */}
          <div className="animate-slideUp" style={{animationDelay: '0.1s'}}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-kid-blue text-white flex items-center justify-center text-[10px]">1</span>
              Chọn phong cách tranh
            </label>
            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
          </div>

          {/* STEP 2: IDEAS */}
          <div className="animate-slideUp" style={{animationDelay: '0.2s'}}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-kid-pink text-white flex items-center justify-center text-[10px]">2</span>
              Chọn ý tưởng
            </label>
            <IdeaSelector 
              ideas={ideas}
              selectedId={selectedIdeaId}
              onSelect={handleSelectIdea}
              customInput={customVnInput}
              onCustomInputChange={(val) => setCustomVnInput(val)}
            />
          </div>

          {/* STEP 3: PROMPT */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-slideUp" style={{animationDelay: '0.3s'}}>
             <div className="flex justify-between items-center mb-2">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-kid-green text-white flex items-center justify-center text-[10px]">3</span>
                  Mô tả cho AI (Tiếng Anh)
               </label>
               <div className="flex gap-2">
                 <button onClick={() => setIsEnEditable(!isEnEditable)} className="text-xs font-bold text-kid-blue hover:underline flex items-center gap-1">
                   <Edit size={12} /> {isEnEditable ? 'Xong' : 'Sửa'}
                 </button>
                 <button onClick={() => {navigator.clipboard.writeText(enPrompt); alert('Đã chép!');}} className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
                   <Copy size={12} /> Chép
                 </button>
               </div>
             </div>
             
             {isTranslating ? (
               <div className="h-20 flex items-center justify-center gap-2 text-kid-blue text-sm font-bold bg-white rounded-xl border border-blue-100">
                  <Loader2 className="animate-spin" size={16} /> Đang dịch ý tưởng sang tiếng Anh...
               </div>
             ) : (
               <textarea 
                  value={enPrompt}
                  onChange={(e) => setEnPrompt(e.target.value)}
                  readOnly={!isEnEditable}
                  className={`w-full bg-white rounded-xl p-3 text-sm text-gray-600 border ${isEnEditable ? 'border-kid-blue ring-1 ring-kid-blue' : 'border-gray-200'} focus:outline-none resize-none h-20 transition-all`}
                  placeholder="Chọn ý tưởng ở trên để tự động tạo mô tả..."
               />
             )}
          </div>

          {/* GENERATE BUTTON */}
          <div className="pt-2">
            {!apiKey ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4 animate-bounce-subtle">
                 <div className="bg-orange-100 p-2 rounded-full text-orange-500">
                    <PenTool size={24} />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-bold text-orange-800 text-sm">Đang tải Khóa API...</h4>
                   <p className="text-xs text-orange-600">Nếu thông báo này không biến mất, hãy thử tải lại trang.</p>
                 </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !enPrompt || isTranslating}
                className="w-full py-4 bg-gradient-to-r from-kid-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 transform hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGeneratingImage ? <Loader2 className="animate-spin w-6 h-6" /> : <Wand2 className="w-6 h-6" />}
                {isGeneratingImage ? 'AI Đang vẽ...' : 'VẼ TRANH NGAY! 🎨'}
              </button>
            )}
            {errorMsg && <p className="text-red-500 text-sm font-bold text-center mt-3 bg-red-50 py-2 rounded-lg border border-red-100">{errorMsg}</p>}
          </div>
        </div>

        {/* RIGHT: Preview & Result */}
        <div className="w-full xl:w-[420px] flex-shrink-0">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block text-center xl:text-left">
              Kết quả tác phẩm
          </label>
          
          <div className="sticky top-6">
            <div className={`
              aspect-square rounded-[32px] flex items-center justify-center relative overflow-hidden transition-all duration-500
              ${isGeneratingImage ? 'bg-white border-4 border-kid-blue shadow-inner' : 'bg-gray-50 border-4 border-dashed border-gray-200'}
              ${previewUrl ? 'border-none shadow-2xl rotate-1 hover:rotate-0' : ''}
            `}>
              
              {/* STATE 1: GENERATING */}
              {isGeneratingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90 backdrop-blur-sm">
                   <div className="relative w-24 h-24 mb-4">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/1048/1048944.png" 
                        className="w-full h-full object-contain animate-bounce" 
                        alt="Pencil"
                      />
                   </div>
                   <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-kid-blue to-kid-purple animate-pulse">
                     {loadingText}
                   </h3>
                </div>
              )}

              {/* STATE 2: HAS PREVIEW */}
              {previewUrl ? (
                <div className="relative w-full h-full group">
                  <img src={previewUrl} alt="Generated" className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    {!isSaved ? (
                      <button 
                        onClick={handleSaveToRepository}
                        disabled={isSaving}
                        className="bg-kid-green text-white px-8 py-3 rounded-full shadow-lg hover:bg-green-500 font-bold flex items-center gap-2 w-56 justify-center text-lg" 
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={22}/> : <Save size={22} />}
                        Lưu vào kho
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3 animate-fadeIn">
                        <span className="bg-green-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 justify-center shadow-lg">
                           <Check size={20} className="stroke-[3px]" /> Đã lưu!
                        </span>
                        {onSuccess && (
                          <button 
                            onClick={onSuccess} 
                            className="bg-white text-kid-blue px-6 py-2 rounded-full font-bold flex items-center gap-2 justify-center hover:bg-blue-50 shadow-md"
                          >
                             <ExternalLink size={18} /> Mở Kho
                          </button>
                        )}
                      </div>
                    )}
                    
                    <a 
                      href={previewUrl} 
                      download={`art_${Date.now()}.png`}
                      className="bg-white text-gray-800 px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 font-bold flex items-center gap-2 w-56 justify-center"
                    >
                      <Download size={20} /> Tải ảnh về
                    </a>
                  </div>
                </div>
              ) : (
                /* STATE 3: EMPTY */
                <div className="text-center p-6">
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <ImageIcon size={48} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold text-lg">Tranh của bé sẽ hiện ở đây</p>
                  
                  {!checkFirebaseStatus().ready && (
                     <div className="mt-4 flex items-center justify-center gap-2 text-red-400 bg-red-50 p-2 rounded-lg text-xs font-bold border border-red-100">
                        <AlertTriangle size={16} /> Lỗi Config Firebase
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
