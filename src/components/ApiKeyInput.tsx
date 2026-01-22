import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  onKeyChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeyChange }) => {
  const [key, setKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) {
      setKey(stored);
      onKeyChange(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', key);
    onKeyChange(key);
    alert("Đã lưu khóa API! Bạn có thể bắt đầu vẽ tranh.");
  };

  return (
    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Key size={18} className="text-blue-600" />
        <h4 className="font-bold text-blue-800 text-sm">Nhập khóa API Gemini (Yêu cầu để tạo tranh)</h4>
      </div>
      <p className="text-xs text-blue-600 mb-3">
        Để tạo tranh miễn phí, bạn cần có khóa API từ Google AI Studio. 
        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold ml-1">Lấy khóa tại đây</a>.
      </p>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input 
            type={isVisible ? "text" : "password"} 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Dán khóa API của bạn vào đây (AIza...)"
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-blue-200 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button 
          onClick={handleSave}
          disabled={!key}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Lưu
        </button>
      </div>
    </div>
  );
};