export function LoadingState({ message = "Loading" }: { message?: string }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-md bg-emerald-100" />
        ))}
      </div>
    </div>
  );
}

