import { X, CheckCircle2, GitBranch, Terminal } from "lucide-react";

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AndroidApkModal({ isOpen, onClose }: AndroidApkModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <GitBranch size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Xuất App Android & GitHub</h3>
              <p className="text-xs text-slate-400">
                Tự động build file .APK qua GitHub Actions hoặc cài PWA ngay
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 mt-5 text-sm">
          {/* Method 1: PWA (Recommended for instant use) */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
              <CheckCircle2 size={18} />
              <span>Cách 1: Dùng ngay không cần cài đặt (PWA)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mở link ứng dụng này trên trình duyệt Chrome/Samsung Internet của điện thoại Android, bấm Menu 3 chấm (⋮) ➔ Chọn <strong>"Thêm vào Màn hình chính" (Cài đặt ứng dụng)</strong>. App sẽ xuất hiện trên màn hình như 1 app native, chạy toàn màn hình và dùng được offline!
            </p>
          </div>

          {/* Method 2: GitHub Actions Auto Build APK */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <GitBranch size={18} />
              <span>Cách 2: Tự động xuất file .APK qua GitHub Actions</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dự án đã tích hợp sẵn file <code>.github/workflows/build-apk.yml</code>. Bạn chỉ cần đẩy mã nguồn lên GitHub của bạn:
            </p>

            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-indigo-200 space-y-1">
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m "feat: rmb exchange app for android"</p>
              <p>git branch -M main</p>
              <p>git remote add origin https://github.com/YOUR_USERNAME/rmb-exchange-app.git</p>
              <p>git push -u origin main</p>
            </div>

            <p className="text-xs text-slate-400">
              👉 Sau khi push, tab <strong>Actions</strong> trên GitHub sẽ tự động compile và tạo file <strong>app-debug.apk</strong> trong mục Artifacts để bạn tải về cài thẳng vào điện thoại!
            </p>
          </div>

          {/* Method 3: Local Android Studio Build */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Terminal size={18} />
              <span>Cách 3: Build trên máy bằng Android Studio</span>
            </div>
            <p className="text-xs text-slate-400">
              Khi máy có Android Studio và Java:
            </p>
            <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-amber-200">
              npx cap add android && npx cap open android
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
