import { CheckCircle2, Circle } from "lucide-react";
import { ActionPlan } from "../../types/domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { BadgePill } from "../ui/BadgePill";

export function ActionPlanList({
  plan,
  onUpdateItem
}: {
  plan: ActionPlan | null;
  onUpdateItem: (id: string, status: "Pending" | "Completed") => Promise<void>;
}) {
  return (
    <Card>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold text-ink">{plan?.title ?? "30-Day Action Plan"}</h2>
          <p className="mt-1 text-sm text-slate-600">{plan?.summary ?? "Generate a plan to start completing daily actions."}</p>
        </div>
      </div>
      <div className="mt-5 max-h-[620px] space-y-3 overflow-y-auto pr-1">
        {(plan?.items ?? []).map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border border-emerald-100 bg-white p-3">
            <div>
              <p className="text-sm font-bold text-forest">Day {item.dayNumber}</p>
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <BadgePill label={item.category} variant="blue" />
                <BadgePill label={item.difficulty} variant={item.difficulty === "Easy" ? "green" : "amber"} />
                <BadgePill label={`${Number(item.estimatedSavingsKgCo2e).toFixed(1)} kg`} variant="neutral" />
              </div>
            </div>
            <Button
              variant={item.status === "Completed" ? "secondary" : "primary"}
              onClick={() => onUpdateItem(item.id, item.status === "Completed" ? "Pending" : "Completed")}
              aria-label={`Mark day ${item.dayNumber} ${item.status === "Completed" ? "pending" : "completed"}`}
            >
              {item.status === "Completed" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

