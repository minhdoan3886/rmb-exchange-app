import { useState, useEffect } from "react";
import { RefreshCw, Zap, ShieldCheck, Check } from "lucide-react";
import { fetchOKXRates, getCachedOKXRates, type OKXRates } from "../lib/okxService";
import { formatNumber, triggerHaptic } from "../lib/utils";

interface OKXRateBarProps {
  onApplyVnd: (rate: number) => void;
  onApplyCny: (rate: number) => void;
  currentUsdtRate?: number;
  currentRmbRate?: number;
}

export default function OKXRateBar({
  onApplyVnd,
  onApplyCny,
  currentUsdtRate,
  currentRmbRate,
}: OKXRateBarProps) {
  const [rates, setRates] = useState<OKXRates>(getCachedOKXRates());
  const [loading, setLoading] = useState<boolean>(false);
  const [justApplied, setJustApplied] = useState<"vnd" | "cny" | "all" | null>(null);

  // Common market presets for fast 1-tap switching
  const vndPresets = [25400, 25450, 25500, 25850, 26000];
  const rmbPresets = [7.18, 7.22, 7.25, 7.28, 7.32];

  const handleFetchOKX = async () => {
    triggerHaptic("medium");
    setLoading(true);
    try {
      const data = await fetchOKXRates();
      setRates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    handleFetchOKX();
  }, []);

  const handleApplyVnd = (rate: number) => {
    triggerHaptic("light");
    onApplyVnd(rate);
    setJustApplied("vnd");
    setTimeout(() => setJustApplied(null), 1500);
  };

  const handleApplyCny = (rate: number) => {
    triggerHaptic("light");
    onApplyCny(rate);
    setJustApplied("cny");
    setTimeout(() => setJustApplied(null), 1500);
  };

  const handleApplyBothOKX = () => {
    triggerHaptic("success");
    onApplyVnd(rates.usdtVnd);
    onApplyCny(rates.cnyUsdt);
    setJustApplied("all");
    setTimeout(() => setJustApplied(null), 1500);
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
      {/* Bar Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Zap size={18} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Nguồn Tỷ Giá OKX
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase">
                {rates.source === "okx_live"
                  ? "Trực tiếp"
                  : rates.source === "okx_cache"
                  ? "Bộ nhớ đệm"
                  : "Chuẩn định mức"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cập nhật: {rates.lastUpdated}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyBothOKX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-xs font-bold text-white shadow-md shadow-indigo-600/20"
          >
            {justApplied === "all" ? (
              <>
                <Check size={14} />
                <span>Đã áp dụng cả 2</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Áp dụng giá OKX</span>
              </>
            )}
          </button>

          <button
            onClick={handleFetchOKX}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all disabled:opacity-50 border border-slate-700/60"
            title="Tải lại từ OKX"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-400" : ""} />
          </button>
        </div>
      </div>

      {/* OKX Rates Quick Ticker & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* VND / USDT Section */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tỷ giá USDT (₫/$) từ OKX
            </span>
            <button
              onClick={() => handleApplyVnd(rates.usdtVnd)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
            >
              Dùng {formatNumber(rates.usdtVnd)} ₫
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <span className="text-2xl font-black text-white font-mono">
              {formatNumber(rates.usdtVnd)} <span className="text-sm text-slate-400 font-normal">₫/USDT</span>
            </span>
            {currentUsdtRate === rates.usdtVnd && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                Đang dùng
              </span>
            )}
          </div>

          {/* VND Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 self-center mr-1">Nhanh:</span>
            {vndPresets.map((rate) => (
              <button
                key={rate}
                onClick={() => handleApplyVnd(rate)}
                className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition-all ${
                  currentUsdtRate === rate
                    ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700"
                }`}
              >
                {formatNumber(rate)}
              </button>
            ))}
          </div>
        </div>

        {/* CNY / USDT Section */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tỷ giá Tệ/USDT (¥/$) từ OKX
            </span>
            <button
              onClick={() => handleApplyCny(rates.cnyUsdt)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
            >
              Dùng {rates.cnyUsdt} ¥
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-3">
            <span className="text-2xl font-black text-white font-mono">
              {rates.cnyUsdt} <span className="text-sm text-slate-400 font-normal">¥/USDT</span>
            </span>
            {currentRmbRate === rates.cnyUsdt && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                Đang dùng
              </span>
            )}
          </div>

          {/* CNY Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 self-center mr-1">Nhanh:</span>
            {rmbPresets.map((rate) => (
              <button
                key={rate}
                onClick={() => handleApplyCny(rate)}
                className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition-all ${
                  currentRmbRate === rate
                    ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700"
                }`}
              >
                {rate}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
