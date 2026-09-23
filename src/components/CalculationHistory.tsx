import { useState } from "react";
import { History, Trash2, Clock, ArrowRight, Copy, Check } from "lucide-react";
import { type HistoryItem, clearHistory } from "../lib/storage";
import { formatNumber, copyToClipboard, triggerHaptic } from "../lib/utils";

interface CalculationHistoryProps {
  items: HistoryItem[];
  onRefresh: () => void;
  onSelectItem?: (item: HistoryItem) => void;
}

export default function CalculationHistory({
  items,
  onRefresh,
}: CalculationHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleClear = () => {
    if (confirm("Bạn có chắc chắn muốn xoá toàn bộ lịch sử tính toán không?")) {
      triggerHaptic("medium");
      clearHistory();
      onRefresh();
    }
  };

  const handleCopyItem = async (item: HistoryItem) => {
    triggerHaptic("light");
    const text = `${formatNumber(item.rmbAmount)} RMB -> ${formatNumber(item.resultUsdt)} USDT -> ${formatNumber(item.totalVnd)} VNĐ (1 Tệ = ${formatNumber(item.rate1RmbEffective)} ₫)`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
        <Clock size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Chưa có lịch sử tính toán nào</p>
        <p className="text-xs text-slate-500 mt-1">
          Nhấn nút "Lưu lại" trong bảng tính để lưu các đơn hàng bạn cần theo dõi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} className="text-indigo-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Lịch sử gần đây ({items.length})
          </h4>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors p-1"
        >
          <Trash2 size={13} />
          <span>Xoá hết</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const dateStr = new Date(item.timestamp).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          });

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white font-mono">
                    {formatNumber(item.rmbAmount)} ¥
                  </span>
                  <ArrowRight size={14} className="text-slate-500" />
                  <span className="text-sm font-bold text-indigo-400 font-mono">
                    {formatNumber(item.resultUsdt)} $
                  </span>
                  <ArrowRight size={14} className="text-slate-500" />
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatNumber(item.totalVnd)} ₫
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>1 ¥ = {formatNumber(item.rate1RmbEffective)} ₫</span>
                  <span>•</span>
                  <span>USDT {formatNumber(item.usdtRate)} ₫</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleCopyItem(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 transition-all"
                  title="Sao chép"
                >
                  {copiedId === item.id ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
