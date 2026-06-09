import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: "default" | "glass" | "clay";
};

export function Card({ children, className = "", variant = "glass", ...props }: CardProps) {
  const baseClasses = variant === "clay"
    ? "rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-slate-100 p-5"
    : variant === "glass"
    ? "bg-white/70 backdrop-blur-md border border-white/30 shadow-sm rounded-2xl p-5"
    : "rounded-md border border-emerald-100 bg-white p-5 shadow-soft";

  return (
    <section className={`${baseClasses} ${className}`} {...props}>
      {children}
    </section>
  );
}

