import { ArrowDown, Sparkles } from "lucide-react";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function FutureYouSection({
  currentEmissions,
  projectedEmissions,
  estimatedReductionKg,
  estimatedReductionPercent,
  timeframeDays,
  explanation,
  recommendationHint
}: {
  currentEmissions: number;
  projectedEmissions: number;
  estimatedReductionKg: number;
  estimatedReductionPercent: number;
  timeframeDays: number;
  explanation: string;
  recommendationHint: string;
}) {
  return (
    <Card className="space-y-5" id="future-you">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-sky-100 p-3 text-skyline">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-ink">Future You</h2>
          <p className="text-sm text-slate-600">A visible comparison of your current path and your lower-carbon path.</p>
        </div>
      </div>
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-md bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Current Emissions</p>
          <p className="mt-2 text-3xl font-black text-ink">{currentEmissions.toFixed(1)}</p>
          <p className="text-sm font-semibold text-slate-600">kg CO2e this month</p>
        </div>
        <div className="hidden items-center justify-center text-slate-400 md:flex">
          <ArrowDown className="-rotate-90" aria-hidden="true" />
        </div>
        <div className="rounded-md bg-sky-50 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Projected Emissions</p>
          <p className="mt-2 text-3xl font-black text-skyline">{projectedEmissions.toFixed(1)}</p>
          <p className="text-sm font-semibold text-slate-600">kg CO2e in {timeframeDays} days</p>
        </div>
        <div className="hidden items-center justify-center text-slate-400 md:flex">
          <ArrowDown className="-rotate-90" aria-hidden="true" />
        </div>
        <div className="rounded-md bg-mint p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Estimated Reduction</p>
          <p className="mt-2 text-3xl font-black text-forest">{estimatedReductionPercent.toFixed(1)}%</p>
          <p className="text-sm font-semibold text-slate-600">{estimatedReductionKg.toFixed(1)} kg CO2e</p>
        </div>
      </div>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}
