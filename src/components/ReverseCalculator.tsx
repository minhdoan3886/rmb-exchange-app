import { useState } from "react";
import { ArrowLeftRight, Copy, Check } from "lucide-react";
import { formatNumber, copyToClipboard, triggerHaptic } from "../lib/utils";

interface ReverseCalculatorProps {
  defaultUsdtRate: number;
  defaultRmbRate: number;
}

export default function ReverseCalculator({
  defaultUsdtRate,
  defaultRmbRate,
}: ReverseCalculatorProps) {
  const [sourceType, setSourceType] = useState<"VND" | "USDT">("VND");
  const [vndInput, setVndInput] = useState<number>(10000000);
  const [usdtInput, setUsdtInput] = useState<number>(500);
  const [usdtRate, setUsdtRate] = useState<number>(defaultUsdtRate || 25450);
  const [rmbUsdtRate, setRmbUsdtRate] = useState<number>(defaultRmbRate || 7.25);
  const [fee] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculation
  let calculatedUsdt = 0;
  let calculatedRmb = 0;
  let calculatedVnd = 0;

  if (sourceType === "VND") {
    calculatedVnd = vndInput;
    const usdtFromVnd = usdtRate > 0 ? vndInput / usdtRate : 0;
    calculatedUsdt = Math.max(0, usdtFromVnd - fee);
    calculatedRmb = calculatedUsdt * rmbUsdtRate;
  } else {
    calculatedUsdt = usdtInput;
    calculatedVnd = usdtInput * usdtRate;
    const netUsdt = Math.max(0, usdtInput - fee);
    calculatedRmb = netUsdt * rmbUsdtRate;
  }

  const effectiveRate =
    calculatedRmb > 0 ? calculatedVnd / calculatedRmb : 0;

  const handleCopy = async () => {
    triggerHaptic("medium");
    const summary = `🔄 TÍNH NGƯỢC (ĐỔI SANG TỆ):
- Nguồn: ${
      sourceType === "VND"
        ? `${formatNumber(vndInput)} VNĐ`
        : `${formatNumber(usdtInput)} USDT`
    }
- Tỷ giá: USDT ${formatNumber(usdtRate)} ₫ | Tệ/USDT ${rmbUsdtRate} ¥
👉 ĐỔI ĐƯỢC: ${formatNumber(calculatedRmb)} RMB (¥)
👉 Tương đương: ${formatNumber(calculatedUsdt)} USDT
👉 Tỷ giá thực tế: 1 RMB = ${formatNumber(effectiveRate)} ₫`;

    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-[2.2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ArrowLeftRight size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Tính ngược sang Tệ</h3>
              <p className="text-xs text-slate-400">
                Có sẵn VNĐ hoặc USDT thì mua được bao nhiêu Tệ RMB?
              </p>
            </div>
          </div>

          {/* Toggle Type */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                triggerHaptic("light");
                setSourceType("VND");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sourceType === "VND"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Có tiền VNĐ (₫)
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setSourceType("USDT");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sourceType === "USDT"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Có USDT ($)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sourceType === "VND" ? (
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Số tiền VNĐ bạn có
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={vndInput || ""}
                  onChange={(e) => setVndInput(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-2xl font-mono font-bold text-emerald-400 focus:border-indigo-500 outline-none"
                  placeholder="10,000,000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₫
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Số USDT bạn có
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={usdtInput || ""}
                  onChange={(e) => setUsdtInput(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-2xl font-mono font-bold text-indigo-400 focus:border-indigo-500 outline-none"
                  placeholder="500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  $
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Tỷ giá USDT (₫)
              </label>
              <input
                type="number"
                value={usdtRate || ""}
                onChange={(e) => setUsdtRate(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-lg font-mono font-bold text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Tệ/USDT (¥/$)
              </label>
              <input
                type="number"
                step="0.01"
                value={rmbUsdtRate || ""}
                onChange={(e) => setRmbUsdtRate(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 text-lg font-mono font-bold text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Số Tệ (RMB) nhận được ước tính
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono">
                {formatNumber(calculatedRmb)}
              </span>
              <span className="text-xl font-bold text-slate-400">¥ RMB</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Tương đương: {formatNumber(calculatedUsdt)} USDT • Tỷ giá thực tế: 1 ¥ ≈ {formatNumber(effectiveRate)} ₫
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-300" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Sao chép kết quả</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
