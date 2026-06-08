import { Check, Target, X } from "lucide-react";
import { Recommendation } from "../../types/domain";
import { BadgePill } from "../ui/BadgePill";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function RecommendationCard({
  recommendation,
  isUpdating,
  onUpdate
}: {
  recommendation: Recommendation;
  isUpdating?: boolean;
  onUpdate: (id: string, status: Recommendation["status"]) => Promise<void>;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-mint p-3 text-forest">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-ink">{recommendation.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{recommendation.description}</p>
          </div>
        </div>
        <BadgePill label={recommendation.status} variant={recommendation.status === "Completed" ? "green" : "neutral"} />
      </div>
      <div className="flex flex-wrap gap-2">
        <BadgePill label={recommendation.category.name} variant="blue" />
        <BadgePill label={recommendation.difficulty} variant={recommendation.difficulty === "Easy" ? "green" : "amber"} />
        <BadgePill label={`${Number(recommendation.estimatedSavingsKgCo2e).toFixed(1)} kg CO2e`} variant="neutral" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" isLoading={isUpdating} loadingLabel="Saving..." onClick={() => onUpdate(recommendation.id, "Accepted")}>
          Accept
        </Button>
        <Button
          isLoading={isUpdating}
          loadingLabel="Completing..."
          feedbackState={recommendation.status === "Completed" ? "success" : "idle"}
          successLabel="Completed"
          disabled={recommendation.status === "Completed"}
          onClick={() => onUpdate(recommendation.id, "Completed")}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Complete
        </Button>
        <Button variant="ghost" isLoading={isUpdating} loadingLabel="Saving..." onClick={() => onUpdate(recommendation.id, "Dismissed")}>
          <X className="h-4 w-4" aria-hidden="true" />
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
