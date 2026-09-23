import { useState, useEffect } from "react";
import {
  ArrowRight,
  RefreshCcw,
  Copy,
  Check,
  Share2,
  Sparkles,
  BookmarkPlus,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatNumber, formatCurrency, copyToClipboard, triggerHaptic } from "../lib/utils";
import { saveHistoryItem, getStoredSettings } from "../lib/storage";
import OKXRateBar from "./OKXRateBar";
import RateHighlightCard from "./RateHighlightCard";
import QuickPresets from "./QuickPresets";

interface ConversionCalculatorProps {
  onHistoryUpdated?: () => void;
}

export default function ConversionCalculator({ onHistoryUpdated }: ConversionCalculatorProps) {
  const initialSettings = getStoredSettings();

  const [rmbAmount, setRmbAmount] = useState<number>(1000);
  const [usdtRate, setUsdtRate] = useState<number>(initialSettings.defaultUsdtRate || 25450); // VND/USDT
  const [rmbUsdtRate, setRmbUsdtRate] = useState<number>(initialSettings.defaultRmbRate || 7.25); // RMB/USDT
  const [conversionFee, setConversionFee] = useState<number>(initialSettings.defaultFee || 0); // USDT

  const [resultUsdt, setResultUsdt] = useState<number>(0);
  const [totalVnd, setTotalVnd] = useState<number>(0);

  const [copiedInvoice, setCopiedInvoice] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Calculation Logic per user specification:
  // usdtNeeded = (rmbAmount / rmbUsdtRate) + conversionFee
  // totalVnd = usdtNeeded * usdtRate
  useEffect(() => {
    if (rmbUsdtRate <= 0) return;
    const usdtNeeded = (rmbAmount / rmbUsdtRate) + conversionFee;
    setResultUsdt(usdtNeeded);
    setTotalVnd(usdtNeeded * usdtRate);
  }, [rmbAmount, usdtRate, rmbUsdtRate, conversionFee]);

  const handleCopySummary = async () => {
    triggerHaptic("medium");
    const base1Rmb = (1 / rmbUsdtRate) * usdtRate;
    const effective1Rmb = rmbAmount > 0 ? totalVnd / rmbAmount : base1Rmb;

    const summary = `🧾 BẢNG TÍNH QUY ĐỔI TỆ ➔ ĐÔ ➔ VNĐ (Nguồn OKX):
━━━━━━━━━━━━━━━━━━━━━━
🔹 Số Tệ cần đổi: ${formatNumber(rmbAmount)} ¥ (RMB)
🔹 Tỷ giá Tệ/USDT: ${rmbUsdtRate} ¥/$
🔹 Tỷ giá USDT/VND: ${formatNumber(usdtRate)} ₫
${conversionFee > 0 ? `🔹 Phí quy đổi: ${conversionFee} USDT\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━
👉 TỔNG USDT CẦN: ${formatNumber(resultUsdt)} USDT
👉 THÀNH TIỀN VNĐ: ${formatNumber(totalVnd)} ₫
👉 TỶ GIÁ 1 TỆ: ${formatNumber(base1Rmb)} ₫${
      conversionFee > 0
        ? ` (Thực tế sau phí: ${formatNumber(effective1Rmb)} ₫)`
        : ""
    }
━━━━━━━━━━━━━━━━━━━━━━
Tạo bởi Ứng dụng RMB Quy Đổi Nhanh`;

    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2500);
    }
  };

  const handleSaveToHistory = () => {
    if (rmbAmount <= 0) return;
    triggerHaptic("success");
    const baseRate1Rmb = (1 / rmbUsdtRate) * usdtRate;
    const effectiveRate1Rmb = rmbAmount > 0 ? totalVnd / rmbAmount : baseRate1Rmb;

    saveHistoryItem({
      rmbAmount,
      usdtRate,
      rmbUsdtRate,
      conversionFee,
      resultUsdt,
      totalVnd,
      rate1RmbBase: baseRate1Rmb,
      rate1RmbEffective: effectiveRate1Rmb,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    if (onHistoryUpdated) onHistoryUpdated();
  };

  const handleFireConfetti = () => {
    triggerHaptic("success");
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if canvas blocked
    }
  };

  const baseRate1Rmb = rmbUsdtRate > 0 ? (1 / rmbUsdtRate) * usdtRate : 0;
  const effectiveRate1Rmb = rmbAmount > 0 ? totalVnd / rmbAmount : baseRate1Rmb;

  return (
    <div className="space-y-6">
      {/* OKX Suggestions Bar */}
      <OKXRateBar
        onApplyVnd={(rate) => setUsdtRate(rate)}
        onApplyCny={(rate) => setRmbUsdtRate(rate)}
        currentUsdtRate={usdtRate}
        currentRmbRate={rmbUsdtRate}
      />

      {/* Prominent 1 RMB -> VND Highlight Card */}
      <RateHighlightCard
        rmbAmount={rmbAmount}
        usdtRate={usdtRate}
        rmbUsdtRate={rmbUsdtRate}
        conversionFee={conversionFee}
        totalVnd={totalVnd}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Card */}
        <div className="lg:col-span-12 xl:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 rounded-[2.2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between border border-indigo-400/30">
          {/* Decorative ambient bubble */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/20 rounded-full -ml-16 -mb-16 blur-xl pointer-events-none" />

          <div className="relative z-10 w-full mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <RefreshCcw size={22} className="text-white" />
                </div>
                <span>Thông số quy đổi</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 border border-white/20"
                  title="Lưu vào lịch sử"
                >
                  {savedSuccess ? (
                    <>
                      <Check size={14} className="text-emerald-300" />
                      <span className="text-emerald-200">Đã lưu</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={14} />
                      <span>Lưu lại</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* RMB Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] uppercase font-black text-white/80 tracking-widest">
                    Số RMB (Tệ) cần có
                  </label>
                  <span className="text-[11px] font-mono text-indigo-200/90 font-medium">
                    = {formatCurrency(rmbAmount, "CNY")}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={rmbAmount || ""}
                    onChange={(e) => setRmbAmount(Number(e.target.value))}
                    className="w-full bg-black/25 border-2 border-white/20 rounded-2xl p-4 text-3xl font-mono font-bold focus:ring-4 focus:ring-white/20 focus:border-white focus:bg-indigo-950/40 outline-none transition-all placeholder:text-white/30 text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 text-2xl font-black">
                    ¥
                  </span>
                </div>

                {/* Quick Add Presets */}
                <div className="mt-3">
                  <QuickPresets
                    currentAmount={rmbAmount}
                    onAddAmount={(delta) => setRmbAmount((prev) => (prev || 0) + delta)}
                    onClear={() => setRmbAmount(0)}
                  />
                </div>
              </div>

              {/* Rate Inputs */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/80 mb-2 tracking-widest">
                    Tỷ giá USDT (₫/$)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={usdtRate || ""}
                      onChange={(e) => setUsdtRate(Number(e.target.value))}
                      className="w-full bg-black/25 border border-white/20 rounded-2xl p-3.5 text-lg font-mono font-bold focus:ring-4 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/30 text-white"
                      placeholder="25,450"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">
                      ₫
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/80 mb-2 tracking-widest">
                    Tệ/USDT (¥/$)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={rmbUsdtRate || ""}
                      onChange={(e) => setRmbUsdtRate(Number(e.target.value))}
                      className="w-full bg-black/25 border border-white/20 rounded-2xl p-3.5 text-lg font-mono font-bold focus:ring-4 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/30 text-white"
                      placeholder="7.25"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">
                      ¥
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion Fee Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] uppercase font-bold text-white/80 tracking-widest">
                    Phí quy đổi (USDT)
                  </label>
                  <span className="text-[11px] text-white/60">
                    (Cộng trực tiếp vào số USDT cần)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={conversionFee === 0 ? "0" : conversionFee || ""}
                    onChange={(e) => setConversionFee(Number(e.target.value))}
                    className="w-full bg-black/25 border border-white/20 rounded-2xl p-3.5 text-lg font-mono font-bold focus:ring-4 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/30 text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-base font-black">
                    $
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mental Formula Footer */}
          <div className="bg-black/25 p-4 rounded-2xl border border-white/15 backdrop-blur-sm self-end w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 block mb-1">
              Công thức nhẩm nhanh
            </span>
            <p className="text-xs font-mono opacity-90 leading-relaxed">
              ({formatNumber(rmbAmount)} ¥ ÷ {rmbUsdtRate}) + {conversionFee} $ ={" "}
              <strong className="text-emerald-300 font-bold">{formatNumber(resultUsdt)} USDT</strong>
              <br />➔ {formatNumber(resultUsdt)} × {formatNumber(usdtRate)} ={" "}
              <strong className="text-emerald-300 font-bold">{formatNumber(totalVnd)} ₫</strong>
            </p>
          </div>
        </div>

        {/* Results Bento */}
        <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Tổng USDT cần đổi */}
          <div className="bg-slate-900/90 p-6 sm:p-7 rounded-[2.2rem] shadow-xl border border-slate-800 flex flex-col justify-between group hover:border-indigo-500/50 transition-all backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-black uppercase tracking-[.2em]">
                Tổng USDT cần đổi
              </span>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-3 py-1 rounded-full uppercase">
                Tether (USDT)
              </span>
            </div>

            <div className="my-6">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight block mb-2 font-mono">
                {formatNumber(resultUsdt)}
              </span>
              <p className="text-xs text-slate-400">
                Gốc: {(rmbAmount / (rmbUsdtRate || 1)).toFixed(2)} USDT
                {conversionFee > 0 && ` + ${conversionFee} USDT phí`}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  triggerHaptic("light");
                  await copyToClipboard(resultUsdt.toFixed(2));
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Copy size={13} />
                <span>Chép số USDT</span>
              </button>
              <span className="text-[11px] font-mono text-indigo-400">
                ≈ ${(resultUsdt).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 2: Thành tiền VNĐ */}
          <div className="bg-slate-900/90 p-6 sm:p-7 rounded-[2.2rem] shadow-xl border border-slate-800 flex flex-col justify-between group hover:border-emerald-500/50 transition-all backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-black uppercase tracking-[.2em]">
                Thành tiền VNĐ
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full uppercase">
                Việt Nam Đồng (₫)
              </span>
            </div>

            <div className="my-6">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight block mb-2 font-mono">
                {formatNumber(totalVnd)}
              </span>
              <p className="text-xs text-slate-400">
                {formatCurrency(totalVnd, "VND")}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  triggerHaptic("light");
                  await copyToClipboard(Math.round(totalVnd).toString());
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Copy size={13} />
                <span>Chép tiền VNĐ</span>
              </button>
              <span className="text-[11px] font-mono text-emerald-400">
                1 Tệ ≈ {formatNumber(effectiveRate1Rmb)} ₫
              </span>
            </div>
          </div>

          {/* Card 3: Market Status & Share Banner */}
          <div className="md:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 text-white p-6 sm:p-7 rounded-[2.2rem] shadow-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden relative">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-2">
                Trạng thái thị trường & Giao dịch
              </p>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-emerald-400 border border-white/10">
                  <ArrowRight size={26} />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Quy đổi sẵn sàng</h4>
                  <p className="text-xs text-slate-400">
                    Tỷ giá VND/USDT cân bằng tại {formatNumber(usdtRate)} ₫
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                {copiedInvoice ? (
                  <>
                    <Check size={18} className="text-emerald-300" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    <span>Sao chép kết quả</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFireConfetti}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition-all text-amber-400 border border-slate-700/60"
                title="Ăn mừng đơn hàng"
              >
                <Sparkles size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
