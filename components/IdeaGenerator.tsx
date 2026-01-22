import React, { useState } from 'react';
import { Sparkles, Lightbulb, Loader2, ImagePlus, Save, Check, RefreshCcw } from 'lucide-react';
import { Button } from './Button';
import { generateCreativeIdeas, generateImageForIdea } from '../services/geminiService';
import { IdeaSuggestion } from '../types';

interface IdeaGeneratorProps {
  grade: number;
  subjectName: string;
  topicName: string;
  onSaveToGallery?: (imageUrl: string, title: string, description: string) => void;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ grade, subjectName, topicName, onSaveToGallery }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<IdeaSuggestion[]>([]);
  
  // State for image generation
  const [generatingImgIndex, setGeneratingImgIndex] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [savedImages, setSavedImages] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      alert("Vui lòng nhập API Key trong phần 'Tạo Tranh Mới' trước khi sử dụng tính năng này.");
      return;
    }

    setLoading(true);
    // Reset images when generating new ideas
    setGeneratedImages({});
    setSavedImages({});
    
    const results = await generateCreativeIdeas(apiKey, grade, subjectName, topicName);
    setIdeas(results);
    setLoading(false);
  };

  const handleGenerateImage = async (index: number, title: string, description: string) => {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) {
      alert("Vui lòng nhập API Key.");
      return;
    }

    setGeneratingImgIndex(index);
    // Reset saved state if regenerating
    setSavedImages(prev => ({ ...prev, [index]: false }));
    
    const imageUrl = await generateImageForIdea(apiKey, title, description);
    
    if (imageUrl) {
      setGeneratedImages(prev => ({ ...prev, [index]: imageUrl }));
    }
    setGeneratingImgIndex(null);
  };

  const handleSave = (index: number, title: string, description: string) => {
    const imageUrl = generatedImages[index];
    if (imageUrl && onSaveToGallery) {
      onSaveToGallery(imageUrl, title, description);
      setSavedImages(prev => ({ ...prev, [index]: true }));
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={() => { setIsOpen(true); if(ideas.length === 0) handleGenerate(); }}
          className="shadow-xl animate-bounce"
        >
          <Sparkles className="mr-2" />
          Bí ý tưởng? Hỏi AI nhé!
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-4 border-kid-pink">
        {/* Header */}
        <div className="p-4 bg-kid-pink text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <Lightbulb size={24} className="text-yellow-300" />
            <h3 className="text-xl font-bold">Góc Sáng Tạo AI</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-purple-50">
          <p className="text-gray-600 mb-4 text-center">
            Dưới đây là gợi ý cho bài: <span className="font-bold text-kid-purple">{topicName}</span>
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-kid-blue">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold animate-pulse">AI đang suy nghĩ ý tưởng siêu hay...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {ideas.map((idea, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="bg-kid-yellow text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 w-full">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{idea.title}</h4>
                      <p className="text-gray-600 mb-3 text-sm">{idea.description}</p>
                      
                      <div className="bg-gray-50 p-3 rounded-xl mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Vật liệu cần có:</span>
                        <div className="flex flex-wrap gap-2">
                          {idea.materials.map((mat, i) => (
                            <span key={i} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-xs font-medium text-kid-purple">
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Image Generation Section */}
                      <div className="mt-2 w-full">
                        {!generatedImages[index] && !generatingImgIndex ? (
                          <button 
                            onClick={() => handleGenerateImage(index, idea.title, idea.description)}
                            className="flex items-center gap-2 text-sm font-bold text-kid-blue hover:text-blue-500 transition-colors"
                          >
                             <ImagePlus size={16} />
                             Xem hình minh họa
                          </button>
                        ) : null}

                        {generatingImgIndex === index && (
                           <div className="flex items-center gap-2 text-sm font-bold text-kid-blue">
                              <Loader2 size={16} className="animate-spin" />
                              Đang vẽ tranh...
                           </div>
                        )}

                        {generatedImages[index] && generatingImgIndex !== index && (
                          <div className="mt-3 animate-fadeIn w-full">
                             <div className="relative rounded-lg overflow-hidden border-2 border-kid-blue/20 bg-gray-100">
                               <img src={generatedImages[index]} alt={idea.title} className="w-full h-48 object-cover" />
                             </div>
                             <div className="mt-3 flex justify-between items-center">
                                <button 
                                  onClick={() => handleGenerateImage(index, idea.title, idea.description)}
                                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-kid-blue font-bold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                  title="Tạo ảnh khác"
                                >
                                  <RefreshCcw size={14} /> Tạo ảnh khác
                                </button>

                                {savedImages[index] ? (
                                  <span className="flex items-center gap-1 text-green-600 text-sm font-bold px-3 py-1 bg-green-50 rounded-lg">
                                    <Check size={16} /> Đã lưu
                                  </span>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="primary" 
                                    className="bg-kid-green hover:bg-green-500 shadow-green-200"
                                    onClick={() => handleSave(index, idea.title, idea.description)}
                                  >
                                    <Save size={16} /> Lưu vào kho
                                  </Button>
                                )}
                             </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-center flex-shrink-0">
          <Button onClick={handleGenerate} disabled={loading} variant="primary">
            {loading ? 'Đang tạo...' : 'Lấy ý tưởng khác 🎲'}
          </Button>
        </div>
      </div>
    </div>
  );
};