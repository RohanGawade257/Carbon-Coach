import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, id, className = "", ...props }: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm font-medium text-ink" htmlFor={textareaId}>
      {label}
      <textarea
        id={textareaId}
        className={`focus-ring mt-2 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-ink shadow-sm ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${textareaId}-error`} className="mt-1 block text-xs text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

