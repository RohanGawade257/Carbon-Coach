import { ReactNode } from "react";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function SummaryMetric({
  title,
  value,
  unit,
  icon,
  explanation,
  recommendationHint
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  explanation: string;
  recommendationHint: string;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {value} {unit ? <span className="text-base font-semibold text-slate-500">{unit}</span> : null}
          </p>
        </div>
        {icon ? <div className="rounded-md bg-mint p-3 text-forest">{icon}</div> : null}
      </div>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}

