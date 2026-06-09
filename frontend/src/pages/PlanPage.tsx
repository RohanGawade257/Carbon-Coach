import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionPlanList } from "../components/carbonTwin/ActionPlanList";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { DashboardResponse } from "../types/api";
import { useToastStore } from "../stores/toastStore";
import { useAuthStore } from "../stores/authStore";

type ActionPlanProgress = DashboardResponse["dashboard"]["widgets"]["planProgress"];
type ActionItemResponse = {
  item: { id: string; status: "Pending" | "Completed" };
  progress: ActionPlanProgress;
};

export function PlanPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const hydrateMe = useAuthStore((state) => state.hydrateMe);

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/overview")
  });

  const itemMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Pending" | "Completed" }) =>
      apiRequest<ActionItemResponse>(`/action-plan/items/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: async (data, variables) => {
      void hydrateMe();
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      const progressText = `Progress is now ${data.progress.completedDays}/${data.progress.totalDays || 30} days.`;
      showToast(variables.status === "Completed" ? `Action completed. ${progressText}` : `Action reopened. ${progressText}`);
    },
    onError: () => showToast("Something Went Wrong", "error")
  });


  if (query.isLoading) return <LoadingState message="Loading 30-Day Plan" />;
  if (query.error) return <ErrorState message="Failed to load 30-Day Plan" />;

  const dashboard = query.data!.dashboard;
  const journey = dashboard.widgets.planProgress;
  const plan = dashboard.actionPlanPreview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">30-Day Plan</h1>
        <p className="mt-1 text-sm text-slate-600">Track and log your daily emissions reduction actions.</p>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold text-slate-500">Plan Journey</p>
            <h2 className="mt-1 text-2xl font-black text-ink">
              {journey.completedDays} / {journey.totalDays || 30} Days Completed
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Completing action-plan days increases your progress and estimated completed savings.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md bg-emerald-50 p-4 min-w-[100px]">
              <p className="text-xs font-bold uppercase text-slate-500">Complete</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.completionPercentage.toFixed(0)}%</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-4 min-w-[100px]">
              <p className="text-xs font-bold uppercase text-slate-500">Savings</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.estimatedSavingsKgCo2e.toFixed(1)} kg</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-4 min-w-[100px]">
              <p className="text-xs font-bold uppercase text-slate-500">Streak</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.currentStreakDays || 0}d</p>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
            <span>{journey.completionPercentage.toFixed(1)}% Complete</span>
            <span>{journey.remainingDays || Math.max(0, 30 - journey.completedDays)} days remaining</span>
          </div>
          <div className="h-4 rounded-full bg-emerald-100">
            <div className="h-4 rounded-full bg-forest transition-all" style={{ width: `${Math.min(100, journey.completionPercentage)}%` }} />
          </div>
        </div>
      </Card>

      <ActionPlanList
        plan={plan}
        updatingItemId={itemMutation.isPending ? itemMutation.variables?.id : undefined}
        onUpdateItem={(id, status) => itemMutation.mutateAsync({ id, status }).then(() => undefined)}
      />
    </div>
  );
}
