import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      // Show iOS prompt logic (maybe delay a bit)
      setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    // Capture install event for Android/Desktop
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] animate-slideUp">
         <div className="max-w-md mx-auto relative pr-8">
            <button onClick={() => setShowIOSPrompt(false)} className="absolute top-0 right-0 text-gray-400">
               <X size={20} />
            </button>
            <div className="flex gap-4 items-start">
               <div className="bg-gray-100 p-2 rounded-xl">
                 <img src="/pwa-192x192.png" className="w-10 h-10 rounded-lg" alt="App Icon" onError={(e) => e.currentTarget.src = 'https://api.iconify.design/noto:artist-palette.svg'}/>
               </div>
               <div className="text-sm text-gray-700">
                  <p className="font-bold mb-1">Cài đặt Xưởng Vẽ Nhí</p>
                  <p>Để cài đặt, nhấn vào nút <Share className="inline w-4 h-4 mx-1" /> bên dưới trình duyệt, sau đó chọn <strong>"Thêm vào Màn hình chính"</strong> (Add to Home Screen).</p>
               </div>
            </div>
         </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white rounded-2xl p-4 shadow-2xl border border-kid-blue/20 z-50 animate-bounce-subtle">
       <div className="flex items-start gap-3">
          <div className="bg-kid-blue/10 p-2 rounded-xl text-kid-blue">
             <Download size={24} />
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-gray-800">Cài đặt ứng dụng</h4>
             <p className="text-xs text-gray-500 mt-1">Thêm vào màn hình chính để sử dụng nhanh hơn và xem tranh offline.</p>
             <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleInstallClick}
                  className="bg-kid-blue text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-500 shadow-sm flex-1"
                >
                  Cài đặt ngay
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  Để sau
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};