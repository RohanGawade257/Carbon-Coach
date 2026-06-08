import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-emerald-100 bg-white p-5 shadow-soft ${className}`}>{children}</section>;
}

