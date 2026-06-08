import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore } from "../../stores/toastStore";

const styles = {
  success: "border-emerald-200 bg-white text-forest",
  error: "border-red-200 bg-white text-red-700",
  info: "border-sky-200 bg-white text-skyline"
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div key={toast.id} className={`flex items-start gap-3 rounded-md border p-4 shadow-soft ${styles[toast.type]}`} role="status">
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm font-semibold">{toast.message}</p>
            <button className="focus-ring rounded-md p-1" type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
