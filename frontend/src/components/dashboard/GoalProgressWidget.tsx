import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function GoalProgressWidget({
  baseline,
  current,
  explanation,
  recommendationHint
}: {
  baseline: number;
  current: number;
  explanation: string;
  recommendationHint: string;
}) {
  const progress = baseline > 0 ? Math.max(0, Math.min(100, 100 - (current / baseline) * 100)) : 0;
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">Reduction Progress</h2>
        <p className="text-sm text-slate-500">Current footprint compared with baseline</p>
      </div>
      <div className="h-3 rounded-full bg-emerald-100">
        <div className="h-3 rounded-full bg-forest" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm font-semibold text-ink">{progress.toFixed(0)}% reduction progress</p>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}

