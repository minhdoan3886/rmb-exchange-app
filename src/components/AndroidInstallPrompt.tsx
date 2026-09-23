import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { triggerHaptic } from "../lib/utils";

export default function AndroidInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA or native webview)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic("medium");
    if (!deferredPrompt) {
      alert("Để cài đặt trên Android: Nhấn vào biểu tượng Menu 3 chấm (⋮) trên góc phải trình duyệt Chrome ➔ Chọn 'Thêm vào Màn hình chính' (Add to Home screen).");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-indigo-500/40 p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 shrink-0">
          <Smartphone size={22} />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Cài đặt ứng dụng trên Android
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-1">
            Chạy toàn màn hình, mượt mà, dùng offline không cần mạng
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
        >
          <Download size={14} />
          <span>Cài ngay</span>
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 text-slate-400 hover:text-white"
          title="Đóng"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
