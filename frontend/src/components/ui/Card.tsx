import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <section className={`rounded-md border border-emerald-100 bg-white p-5 shadow-soft ${className}`} {...props}>
      {children}
    </section>
  );
}
