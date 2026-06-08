import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

export function MonthlyTrendChart({
  data,
  explanation,
  recommendationHint
}: {
  data: Array<{ month: string; kgCo2e: number }>;
  explanation: string;
  recommendationHint: string;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">Monthly Trend</h2>
        <p className="text-sm text-slate-500">Logged emissions over time</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg CO2e`, "Emissions"]} />
            <Line type="monotone" dataKey="kgCo2e" stroke="#2f6f9f" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <InsightPanel explanation={explanation} recommendationHint={recommendationHint} />
    </Card>
  );
}

