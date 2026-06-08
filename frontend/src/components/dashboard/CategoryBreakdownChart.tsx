import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../ui/Card";
import { InsightPanel } from "./InsightPanel";

const colors = ["#1f7a4d", "#2f6f9f", "#f4b942", "#8b5cf6", "#ef4444"];

export function CategoryBreakdownChart({
  data
}: {
  data: Array<{ category: string; kgCo2e: number; percentage: number; explanation: string; recommendationHint: string }>;
}) {
  const insight = data[0] ?? {
    explanation: "Add footprint entries to see which category contributes most.",
    recommendationHint: "Start with transport or energy if you are unsure."
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">Category Breakdown</h2>
        <p className="text-sm text-slate-500">Emissions by source this month</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="kgCo2e" data={data} nameKey="category" innerRadius={60} outerRadius={95} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg CO2e`, "Emissions"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <InsightPanel explanation={insight.explanation} recommendationHint={insight.recommendationHint} />
    </Card>
  );
}

