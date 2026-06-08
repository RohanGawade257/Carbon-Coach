import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CarbonTwinSimulation } from "../../types/domain";
import { Card } from "../ui/Card";

export function SimulationChart({ simulations }: { simulations: CarbonTwinSimulation[] }) {
  const data = simulations.map((simulation) => ({
    name: simulation.scenarioName,
    projected: Number(simulation.projectedKgCo2e),
    savings: Number(simulation.estimatedSavingsKgCo2e)
  }));

  return (
    <Card>
      <h2 className="text-xl font-bold text-ink">Simulation History</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg CO2e`, ""]} />
            <Bar dataKey="projected" fill="#2f6f9f" name="Projected" />
            <Bar dataKey="savings" fill="#1f7a4d" name="Savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

