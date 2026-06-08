import { ButtonHTMLAttributes, ReactNode } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
  feedbackState?: "idle" | "loading" | "success" | "error";
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  children: ReactNode;
};

const variants = {
  primary: "bg-forest text-white hover:bg-emerald-800",
  secondary: "bg-white text-ink border border-emerald-200 hover:bg-mint",
  ghost: "bg-transparent text-ink hover:bg-emerald-50",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

export function Button({
  variant = "primary",
  children,
  className = "",
  isLoading = false,
  feedbackState = "idle",
  loadingLabel,
  successLabel,
  errorLabel,
  disabled,
  ...props
}: ButtonProps) {
  const state = isLoading ? "loading" : feedbackState;
  const content =
    state === "loading" ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {loadingLabel ?? children}
      </>
    ) : state === "success" ? (
      <>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {successLabel ?? children}
      </>
    ) : state === "error" ? (
      <>
        <XCircle className="h-4 w-4" aria-hidden="true" />
        {errorLabel ?? children}
      </>
    ) : (
      children
    );

  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || state === "loading"}
      aria-busy={state === "loading"}
      {...props}
    >
      {content}
    </button>
  );
}
