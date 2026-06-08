import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function CarbonTwinProjectionChart({
  data,
  explanation,
  recommendationHint
}: {
  data: Array<{ label: string; baseline: number; actionPlan: number }>;
  explanation: string;
  recommendationHint: string;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">Carbon Twin Projection</h2>
        <p className="text-sm text-slate-500">Current path compared with action-plan path</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg CO2e`, "Projection"]} />
            <Line type="monotone" dataKey="baseline" stroke="#ef4444" strokeWidth={3} name="Current path" />
            <Line type="monotone" dataKey="actionPlan" stroke="#1f7a4d" strokeWidth={3} name="Action plan" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}

