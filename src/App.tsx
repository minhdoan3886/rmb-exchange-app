import { useState, useEffect } from "react";
import {
  Calculator,
  ArrowLeftRight,
  History,
  GitBranch,
} from "lucide-react";
import ConversionCalculator from "./components/ConversionCalculator";
import ReverseCalculator from "./components/ReverseCalculator";
import CalculationHistory from "./components/CalculationHistory";
import AndroidInstallPrompt from "./components/AndroidInstallPrompt";
import AndroidApkModal from "./components/AndroidApkModal";
import { getStoredHistory, type HistoryItem, getStoredSettings } from "./lib/storage";
import { triggerHaptic } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState<"convert" | "reverse" | "history">("convert");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const settings = getStoredSettings();

  const refreshHistory = () => {
    setHistoryItems(getStoredHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleTabChange = (tab: "convert" | "reverse" | "history") => {
    triggerHaptic("light");
    setActiveTab(tab);
    if (tab === "history") {
      refreshHistory();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white pb-16 sm:pb-8">
      {/* Top Mobile Status Bar & Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              <span className="font-black text-xl font-mono">¥</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  RMB Quy Đổi Nhanh
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OKX Feed
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tệ (RMB) ➔ Đô (USDT) ➔ VNĐ (1 Tệ = ? ₫)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic("light");
                setIsApkModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              title="Xuất file APK Android qua GitHub"
            >
              <GitBranch size={15} className="text-indigo-400" />
              <span className="hidden sm:inline">Build APK / GitHub</span>
              <span className="sm:hidden font-bold">APK</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 space-y-6">
        {/* Android PWA Install Banner */}
        <AndroidInstallPrompt />

        {/* Tab Navigation Pill */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <button
            onClick={() => handleTabChange("convert")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "convert"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator size={16} />
            <span>Quy đổi Tệ ➔ Đô ➔ VNĐ</span>
          </button>

          <button
            onClick={() => handleTabChange("reverse")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "reverse"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowLeftRight size={16} />
            <span>Tính ngược (VNĐ ➔ Tệ)</span>
          </button>

          <button
            onClick={() => handleTabChange("history")}
            className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History size={16} />
            <span className="hidden sm:inline">Lịch sử</span>
            {historyItems.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Active Tab Views */}
        {activeTab === "convert" && (
          <ConversionCalculator onHistoryUpdated={refreshHistory} />
        )}

        {activeTab === "reverse" && (
          <ReverseCalculator
            defaultUsdtRate={settings.defaultUsdtRate}
            defaultRmbRate={settings.defaultRmbRate}
          />
        )}

        {activeTab === "history" && (
          <CalculationHistory
            items={historyItems}
            onRefresh={refreshHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900 space-y-2">
        <p>
          Ứng dụng quy đổi Tệ - USDT - VNĐ dành cho Android • Nguồn tỷ giá tự động từ OKX P2P Market
        </p>
        <p className="text-[11px] text-slate-600 font-mono">
          Công thức: USDT = (RMB ÷ Tỷ lệ tệ) + phí • VNĐ = USDT × Tỷ giá USDT • 1 Tệ = (1 ÷ Tỷ lệ tệ) × Tỷ giá USDT
        </p>
      </footer>

      {/* GitHub & APK Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
