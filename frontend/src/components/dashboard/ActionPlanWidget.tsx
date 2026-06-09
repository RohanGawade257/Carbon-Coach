import { ActionPlan } from "../../types/domain";
import { Card } from "../ui/Card";
import { BadgePill } from "../ui/BadgePill";
import { InsightPanel } from "./InsightPanel";

export function ActionPlanWidget({ plan }: { plan: ActionPlan | null }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">30-Day Action Plan</h2>
        <p className="text-sm text-slate-500">{plan?.summary ?? "Generate your Carbon Twin action plan to see daily actions."}</p>
      </div>
      <div className="space-y-3">
        {(plan?.items ?? []).slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
            <div>
              <p className="font-semibold text-ink">Day {item.dayNumber}: {item.title}</p>
              <p className="text-sm text-slate-600">{item.category}</p>
            </div>
            <BadgePill label={item.status} variant={item.status === "Completed" ? "green" : "amber"} />
          </div>
        ))}
      </div>
      <InsightPanel
        explanation="Your action plan turns Carbon Twin insights into small daily behaviors."
        recommendationHint="Complete the next pending action before adding more goals."
      />
    </Card>
  );
}

