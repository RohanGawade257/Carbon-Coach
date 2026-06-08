import { CalendarCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function PlanProgressCard({
  completedDays,
  totalDays,
  remainingDays,
  completionPercentage,
  completedEstimatedSavings,
  projectedReductionPercent,
  explanation,
  recommendationHint
}: {
  completedDays: number;
  totalDays: number;
  remainingDays: number;
  completionPercentage: number;
  completedEstimatedSavings: number;
  projectedReductionPercent: number;
  explanation: string;
  recommendationHint: string;
}) {
  return (
    <Card className="space-y-5" id="plan-progress">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">30-Day Plan Progress</p>
          <h2 className="mt-1 text-2xl font-black text-ink">
            {completedDays} / {totalDays || 30} Days Complete
          </h2>
        </div>
        <div className="rounded-md bg-mint p-3 text-forest">
          <CalendarCheck className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>{completionPercentage.toFixed(1)}% completed</span>
          <span>{remainingDays || Math.max(0, 30 - completedDays)} days remaining</span>
        </div>
        <div className="h-4 rounded-full bg-emerald-100">
          <div className="h-4 rounded-full bg-forest transition-all" style={{ width: `${Math.min(100, completionPercentage)}%` }} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Projected Reduction</p>
          <p className="mt-1 text-2xl font-black text-forest">{projectedReductionPercent.toFixed(1)}%</p>
        </div>
        <div className="rounded-md bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Completed Savings</p>
          <p className="mt-1 text-2xl font-black text-forest">{completedEstimatedSavings.toFixed(1)} kg</p>
        </div>
      </div>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}

