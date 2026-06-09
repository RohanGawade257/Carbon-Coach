import { useRef, useState } from "react";
import { FileText, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequestRaw } from "../../lib/apiClient";
import { useToastStore } from "../../stores/toastStore";
import { useAuthStore } from "../../stores/authStore";

type OcrResult = { success: boolean; quantity: number; category: string; activityType: string };

export function BillDropzone() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (f: File) => {
      const form = new FormData();
      form.append("file", f);
      return apiRequestRaw<OcrResult>("/ocr/upload", { method: "POST", body: form });
    },
    onSuccess: (data) => {
      setResult(data);
      void hydrateMe();
      queryClient.invalidateQueries({ queryKey: ["footprintEntries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast(`Logged ${data.quantity} units from ${data.category} bill.`, "success");
    },
    onError: () => showToast("Bill scan failed. Try a text-based file.", "error")
  });


  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    mutation.mutate(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-ink">Auto-Import from Bill</h2>
        <p className="text-sm text-slate-500">Drop a utility bill or receipt (txt, csv, or any file) to extract and log emissions automatically.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload bill or receipt"
        className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-forest bg-emerald-50 scale-[1.01]"
            : "border-emerald-200 bg-white hover:border-forest hover:bg-emerald-50"
        }`}
      >
        <input ref={inputRef} type="file" className="sr-only" accept="*" onChange={onInputChange} />

        {mutation.isPending ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
            <p className="text-sm font-semibold text-forest">Scanning bill…</p>
          </>
        ) : result ? (
          <>
            <CheckCircle className="h-8 w-8 text-forest" />
            <p className="text-sm font-bold text-ink">Logged: {result.quantity} units of {result.category}</p>
            <p className="text-xs text-slate-500">{result.activityType.replace(/_/g, " ")}</p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-forest">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Drop your bill here, or <span className="text-forest underline underline-offset-2">browse</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Supports electricity, transport, food, shopping, and waste receipts</p>
            </div>
          </>
        )}
      </div>

      {file && !mutation.isPending && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-slate-600">
          <FileText className="h-4 w-4 shrink-0 text-forest" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
            className="shrink-0 rounded p-0.5 hover:bg-emerald-100"
            aria-label="Clear file"
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
}
