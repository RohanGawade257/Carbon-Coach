import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionPlanList } from "../components/carbonTwin/ActionPlanList";
import { SimulationChart } from "../components/carbonTwin/SimulationChart";
import { SimulationControls } from "../components/carbonTwin/SimulationControls";
import { TwinProfileCard } from "../components/carbonTwin/TwinProfileCard";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes, DashboardResponse, LocalInsightsMeta } from "../types/api";
import { useToastStore } from "../stores/toastStore";

type ActionPlanProgress = DashboardResponse["dashboard"]["widgets"]["planProgress"];
type ActionItemResponse = {
  item: { id: string; status: "Pending" | "Completed" };
  progress: ActionPlanProgress;
};

function localInsightsMessage(defaultMessage: string, usedLocalInsights?: boolean) {
  return usedLocalInsights
    ? "AI service temporarily unavailable. Using local sustainability insights."
    : defaultMessage;
}

export function CarbonTwinPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const query = useQuery({
    queryKey: ["carbonTwin"],
    queryFn: () => apiRequest<ApiShapes["carbonTwin"]>("/carbon-twin")
  });

  const buildMutation = useMutation({
    mutationFn: () => apiRequest<{ twin: unknown } & LocalInsightsMeta>("/carbon-twin/build", { method: "POST" }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast(localInsightsMessage("Carbon Twin updated. Dashboard insights refreshed.", data.usedLocalInsights), data.usedLocalInsights ? "info" : "success");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  const simulateMutation = useMutation({
    mutationFn: (payload: { days: number; assumptions: Record<string, unknown> }) =>
      apiRequest<{ simulation: unknown } & LocalInsightsMeta>("/carbon-twin/simulate", { method: "POST", body: payload }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast(localInsightsMessage("Simulation generated. Future You projection refreshed.", data.usedLocalInsights), data.usedLocalInsights ? "info" : "success");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  const planMutation = useMutation({
    mutationFn: () => apiRequest<ApiShapes["actionPlan"] & LocalInsightsMeta>("/carbon-twin/action-plan", { method: "POST" }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      const message = data.reusedExistingPlan
        ? "Existing 30-day plan is ready. Progress tracking preserved."
        : "30-day plan ready. Progress tracking started.";
      showToast(localInsightsMessage(message, data.usedLocalInsights), data.usedLocalInsights ? "info" : "success");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  const itemMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Pending" | "Completed" }) =>
      apiRequest<ActionItemResponse>(`/action-plan/items/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: async (data, variables) => {
      queryClient.setQueryData<DashboardResponse>(["dashboard"], (current) => {
        if (!current) return current;
        const actionPlanPreview = current.dashboard.actionPlanPreview
          ? {
              ...current.dashboard.actionPlanPreview,
              items: current.dashboard.actionPlanPreview.items.map((item) =>
                item.id === data.item.id ? { ...item, status: data.item.status } : item
              )
            }
          : current.dashboard.actionPlanPreview;

        return {
          ...current,
          dashboard: {
            ...current.dashboard,
            widgets: {
              ...current.dashboard.widgets,
              planProgress: {
                ...current.dashboard.widgets.planProgress,
                ...data.progress
              }
            },
            actionPlanPreview
          }
        };
      });
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      const progressText = `Progress is now ${data.progress.completedDays}/${data.progress.totalDays || 30} days.`;
      showToast(variables.status === "Completed" ? `Action completed. ${progressText}` : `Action reopened. ${progressText}`);
    },
    onError: () => showToast("Something Went Wrong", "error")
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
          <Button
            variant="secondary"
            isLoading={buildMutation.isPending}
            loadingLabel="Building Carbon Twin..."
            disabled={planMutation.isPending}
            onClick={() => buildMutation.mutate()}
          >
            Rebuild Twin
          </Button>
          <Button
            isLoading={planMutation.isPending}
            loadingLabel="Generating Plan..."
            disabled={buildMutation.isPending}
            onClick={() => planMutation.mutate()}
          >
            Generate 30-Day Plan
          </Button>
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
      <ActionPlanList
        plan={data.latestPlan}
        updatingItemId={itemMutation.isPending ? itemMutation.variables?.id : undefined}
        onUpdateItem={(id, status) => itemMutation.mutateAsync({ id, status }).then(() => undefined)}
      />
    </div>
  );
}
