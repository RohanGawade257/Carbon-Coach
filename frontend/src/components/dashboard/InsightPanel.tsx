import { Lightbulb } from "lucide-react";

export function InsightPanel({ explanation, recommendationHint }: { explanation: string; recommendationHint: string }) {
  return (
    <aside className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" aria-label="AI explanation">
      <div className="mb-2 flex items-center gap-2 font-bold">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        Why this matters
      </div>
      <p>{explanation}</p>
      <p className="mt-2 font-semibold">{recommendationHint}</p>
    </aside>
  );
}

