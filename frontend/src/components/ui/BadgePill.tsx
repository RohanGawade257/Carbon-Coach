const styles = {
  green: "text-emerald-900 border-emerald-200/50",
  blue: "text-skyline border-sky-200/50",
  amber: "text-amber-900 border-amber-200/50",
  red: "text-red-800 border-red-200/50",
  neutral: "text-slate-700 border-slate-200/50"
};

export function BadgePill({ label, variant = "neutral" }: { label: string; variant?: keyof typeof styles }) {
  return (
    <span className={`inline-flex rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  );
}


