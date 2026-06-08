import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
  error?: string;
};

export function Select({ label, options, error, id, className = "", ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm font-medium text-ink" htmlFor={selectId}>
      {label}
      <select
        id={selectId}
        className={`focus-ring mt-2 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-ink shadow-sm ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${selectId}-error`} className="mt-1 block text-xs text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

