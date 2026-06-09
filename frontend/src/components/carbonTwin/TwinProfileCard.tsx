import { Leaf } from "lucide-react";
import { CarbonTwinProfile } from "../../types/domain";
import { Card } from "../ui/Card";

export function TwinProfileCard({ twin }: { twin: CarbonTwinProfile | null }) {
  if (!twin) {
    return (
      <Card>
        <h2 className="text-xl font-bold text-ink">Carbon Twin</h2>
        <p className="mt-2 text-sm text-slate-600">Build your Carbon Twin after onboarding and footprint logging.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-mint p-3 text-forest">
          <Leaf className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Your Carbon Twin</h2>
          <p className="text-sm text-slate-600">{twin.summary}</p>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
          <dt className="text-xs font-bold uppercase text-slate-500">Top source</dt>
          <dd className="mt-1 font-semibold text-ink">{twin.topEmissionSource}</dd>
        </div>
        <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
          <dt className="text-xs font-bold uppercase text-slate-500">Baseline</dt>
          <dd className="mt-1 font-semibold text-ink">{Number(twin.baselineKgCo2eMonthly).toFixed(1)} kg CO2e/month</dd>
        </div>
        <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3 sm:col-span-2">
          <dt className="text-xs font-bold uppercase text-slate-500">Biggest opportunity</dt>
          <dd className="mt-1 font-semibold text-ink">{twin.biggestOpportunity}</dd>
        </div>
        <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
          <dt className="text-xs font-bold uppercase text-slate-500">Goal</dt>
          <dd className="mt-1 text-sm text-ink">{twin.userGoal}</dd>
        </div>
        <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
          <dt className="text-xs font-bold uppercase text-slate-500">Constraints</dt>
          <dd className="mt-1 text-sm text-ink">{twin.userConstraints}</dd>
        </div>
      </dl>
    </Card>
  );
}

