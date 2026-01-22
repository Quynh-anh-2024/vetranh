import React, { useState, useEffect } from 'react';
import { X, Key, Save, Eye, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onKeyUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [storedKey, setStoredKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = localStorage.getItem('artconnect:apiKey');
      if (current) {
        setStoredKey(current);
        setApiKey(current);
      } else {
        setStoredKey(null);
        setApiKey('');
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('artconnect:apiKey', apiKey.trim());
    setStoredKey(apiKey.trim());
    onKeyUpdate();
    alert('Đã lưu khóa API thành công! Bây giờ bạn có thể vẽ tranh.');
    onClose();
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc muốn xóa khóa API khỏi máy này không?')) {
      localStorage.removeItem('artconnect:apiKey');
      setApiKey('');
      setStoredKey(null);
      onKeyUpdate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border-4 border-kid-blue overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-kid-blue p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Key className="w-6 h-6" /> Cài đặt Khóa vẽ
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex gap-3">
              <ShieldCheck className="text-kid-blue flex-shrink-0" size={24} />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">An toàn tuyệt đối</p>
                <p>Khóa API của bạn chỉ được lưu trên trình duyệt của thiết bị này. Chúng tôi không bao giờ gửi nó lên máy chủ.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase block">
              Gemini / Google AI Studio Key
            </label>
            <div className="relative">
              <input
                type={isVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán mã khóa vào đây (bắt đầu bằng AIza...)"
                className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-kid-blue focus:outline-none font-medium text-gray-700 transition-colors"
              />
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-kid-blue"
              >
                {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-kid-blue font-bold hover:underline"
              >
                Chưa có khóa? Lấy tại đây &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          {storedKey ? (
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-red-100 text-red-500 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} /> Xóa Key
            </button>
          ) : null}
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 px-4 py-3 bg-kid-blue text-white rounded-xl font-bold hover:bg-blue-500 shadow-blue-200 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            <Save size={18} /> Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};