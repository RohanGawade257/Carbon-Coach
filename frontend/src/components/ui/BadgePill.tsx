const styles = {
  green: "bg-mint text-emerald-900",
  blue: "bg-sky-100 text-skyline",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-800",
  neutral: "bg-slate-100 text-slate-700"
};

export function BadgePill({ label, variant = "neutral" }: { label: string; variant?: keyof typeof styles }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>{label}</span>;
}

