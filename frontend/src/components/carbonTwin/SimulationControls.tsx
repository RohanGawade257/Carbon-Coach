import { FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

export function SimulationControls({
  isLoading,
  onSimulate
}: {
  isLoading: boolean;
  onSimulate: (payload: { days: number; assumptions: Record<string, unknown> }) => Promise<void>;
}) {
  const [days, setDays] = useState("30");
  const [savingsPercent, setSavingsPercent] = useState("15");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSimulate({
      days: Number(days),
      assumptions: {
        savingsPercent: Number(savingsPercent),
        scenarioName: `${days}-Day Reduction Scenario`
      }
    });
  }

  return (
    <Card>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <h2 className="text-xl font-bold text-ink">Simulate Reductions</h2>
          <p className="mt-1 text-sm text-slate-600">Estimate how small actions change future emissions.</p>
        </div>
        <Input label="Days" type="number" min="7" max="365" value={days} onChange={(event) => setDays(event.target.value)} />
        <Input
          label="Savings percent"
          type="number"
          min="1"
          max="80"
          value={savingsPercent}
          onChange={(event) => setSavingsPercent(event.target.value)}
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isLoading}>
            Run Simulation
          </Button>
        </div>
      </form>
    </Card>
  );
}

