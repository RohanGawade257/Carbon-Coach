import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionPlanList } from "../components/carbonTwin/ActionPlanList";
import { SimulationChart } from "../components/carbonTwin/SimulationChart";
import { SimulationControls } from "../components/carbonTwin/SimulationControls";
import { TwinProfileCard } from "../components/carbonTwin/TwinProfileCard";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";

export function CarbonTwinPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["carbonTwin"],
    queryFn: () => apiRequest<ApiShapes["carbonTwin"]>("/carbon-twin")
  });

  const buildMutation = useMutation({
    mutationFn: () => apiRequest("/carbon-twin/build", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["carbonTwin"] })
  });

  const simulateMutation = useMutation({
    mutationFn: (payload: { days: number; assumptions: Record<string, unknown> }) => apiRequest("/carbon-twin/simulate", { method: "POST", body: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const planMutation = useMutation({
    mutationFn: () => apiRequest<ApiShapes["actionPlan"]>("/carbon-twin/action-plan", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const itemMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Pending" | "Completed" }) =>
      apiRequest(`/action-plan/items/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
    }
  });

  if (query.isLoading) return <LoadingState message="Loading Carbon Twin" />;
  if (query.error) return <ErrorState message={query.error instanceof Error ? query.error.message : "Carbon Twin failed to load"} />;

  const data = query.data!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-ink">Carbon Twin</h1>
          <p className="mt-1 text-sm text-slate-600">A simple personal model for your top source, opportunity, goal, and constraints.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => buildMutation.mutate()} disabled={buildMutation.isPending}>Rebuild Twin</Button>
          <Button onClick={() => planMutation.mutate()} disabled={planMutation.isPending}>Generate 30-Day Plan</Button>
        </div>
      </div>
      {(buildMutation.error || simulateMutation.error || planMutation.error || itemMutation.error) ? (
        <ErrorState message="Carbon Twin action failed. Check your profile and footprint entries." />
      ) : null}
      <TwinProfileCard twin={data.twin} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SimulationControls isLoading={simulateMutation.isPending} onSimulate={(payload) => simulateMutation.mutateAsync(payload).then(() => undefined)} />
        <SimulationChart simulations={data.simulations} />
      </div>
      <ActionPlanList plan={data.latestPlan} onUpdateItem={(id, status) => itemMutation.mutateAsync({ id, status }).then(() => undefined)} />
    </div>
  );
}

