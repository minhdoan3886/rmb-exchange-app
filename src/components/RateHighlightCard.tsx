import { useState } from "react";
import { TrendingUp, Info, Copy, Check } from "lucide-react";
import { formatNumber, copyToClipboard, triggerHaptic } from "../lib/utils";

interface RateHighlightCardProps {
  rmbAmount: number;
  usdtRate: number;
  rmbUsdtRate: number;
  conversionFee: number;
  totalVnd: number;
}

export default function RateHighlightCard({
  rmbAmount,
  usdtRate,
  rmbUsdtRate,
  conversionFee,
  totalVnd,
}: RateHighlightCardProps) {
  const [copied, setCopied] = useState(false);

  // 1 RMB = (1 / rmbUsdtRate) * usdtRate
  const baseRate1Rmb = rmbUsdtRate > 0 ? (1 / rmbUsdtRate) * usdtRate : 0;

  // Effective rate per RMB taking fee into account
  const effectiveRate1Rmb =
    rmbAmount > 0 && totalVnd > 0 ? totalVnd / rmbAmount : baseRate1Rmb;

  const feeDifference = effectiveRate1Rmb - baseRate1Rmb;

  const handleCopyRate = async () => {
    triggerHaptic("light");
    const textToCopy = `Tỷ giá 1 RMB (Tệ): ${formatNumber(baseRate1Rmb)} ₫${
      conversionFee > 0 && rmbAmount > 0
        ? ` | Thực tế sau phí (${conversionFee} USDT): ${formatNumber(effectiveRate1Rmb)} ₫`
        : ""
    } (USDT: ${formatNumber(usdtRate)} ₫, Tệ/USDT: ${rmbUsdtRate})`;
    
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 p-5 shadow-2xl backdrop-blur-xl">
      {/* Decorative ambient glows */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400/90 block">
              Tỷ giá quy đổi 1 Tệ sang VNĐ
            </span>
            <p className="text-[12px] text-slate-400">
              Công thức: (1 / {rmbUsdtRate}) × {formatNumber(usdtRate)} ₫
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyRate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-xs font-semibold text-slate-200 border border-white/10 shadow-sm"
          title="Sao chép tỷ giá 1 Tệ"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-300">Đã chép</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-slate-300" />
              <span>Chép tỷ giá</span>
            </>
          )}
        </button>
      </div>

      {/* Primary 1 RMB = ? VND Display */}
      <div className="relative z-10 my-3 p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Tỷ giá gốc (Chưa phí)
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight font-mono">
              1 ¥ = {formatNumber(baseRate1Rmb)} ₫
            </span>
          </div>
        </div>

        {/* Effective rate badge if there's a fee */}
        {conversionFee > 0 && rmbAmount > 0 && (
          <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
            <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center sm:justify-end gap-1">
              <span>Thực tế trên đơn này</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {formatNumber(effectiveRate1Rmb)} ₫
            </div>
            <div className="text-[11px] text-amber-300/80 font-mono">
              (+{formatNumber(feeDifference)} ₫/tệ do phí)
            </div>
          </div>
        )}
      </div>

      {/* Quick comparison footnote */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Info size={13} className="text-slate-500 shrink-0" />
          <span>
            {rmbAmount > 0
              ? `Quy đổi ${formatNumber(rmbAmount)} RMB = ${formatNumber(totalVnd)} VNĐ`
              : "Nhập số RMB bên dưới để tính thành tiền tức thì"}
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400/90 font-medium">
          1 USDT = {rmbUsdtRate} ¥
        </div>
      </div>
    </div>
  );
}
