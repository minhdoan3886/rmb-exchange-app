import { RotateCcw } from "lucide-react";
import { triggerHaptic } from "../lib/utils";

interface QuickPresetsProps {
  onAddAmount: (amount: number) => void;
  onClear: () => void;
  currentAmount: number;
}

export default function QuickPresets({
  onAddAmount,
  onClear,
  currentAmount,
}: QuickPresetsProps) {
  const presetAdditions = [
    { label: "+100 ¥", value: 100 },
    { label: "+500 ¥", value: 500 },
    { label: "+1.000 ¥", value: 1000 },
    { label: "+5.000 ¥", value: 5000 },
    { label: "+10.000 ¥", value: 10000 },
  ];

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold uppercase tracking-wider">
        <span>Chọn nhanh số RMB (¥)</span>
        {currentAmount > 0 && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onClear();
            }}
            className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
            <span>Xoá</span>
          </button>
        )}
      </div>

      {/* Preset additions (+100, +500, +1k,...) */}
      <div className="flex flex-wrap gap-2">
        {presetAdditions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onAddAmount(item.value);
            }}
            className="flex-1 min-w-[64px] py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-mono font-semibold text-white border border-white/10 backdrop-blur-sm text-center"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
