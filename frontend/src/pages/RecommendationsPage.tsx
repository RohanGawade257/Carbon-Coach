import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RecommendationCard } from "../components/recommendations/RecommendationCard";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes, LocalInsightsMeta } from "../types/api";
import { Recommendation } from "../types/domain";
import { useToastStore } from "../stores/toastStore";

export function RecommendationsPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const query = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => apiRequest<ApiShapes["recommendations"]>("/recommendations")
  });

  const generateMutation = useMutation({
    mutationFn: () => apiRequest<ApiShapes["recommendations"] & LocalInsightsMeta>("/recommendations/generate", { method: "POST" }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast(
        data.usedLocalInsights
          ? "AI service temporarily unavailable. Using local sustainability insights."
          : "Recommendations updated. Duplicate suggestions were avoided.",
        data.usedLocalInsights ? "info" : "success"
      );
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Recommendation["status"] }) => apiRequest(`/recommendations/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      showToast(variables.status === "Completed" ? "Recommendation completed. Badge progress refreshed." : "Recommendation updated. Dashboard next actions refreshed.");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  if (query.isLoading) return <LoadingState message="Loading recommendations" />;
  if (query.error) return <ErrorState message="Recommendations failed to load" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black text-ink">Recommendations</h1>
          <p className="mt-1 text-sm text-slate-600">Structured AI recommendations validated before saving.</p>
        </div>
        <Button isLoading={generateMutation.isPending} loadingLabel="Generating Recommendations..." onClick={() => generateMutation.mutate()}>
          Generate Recommendations
        </Button>
      </div>
      {generateMutation.error || updateMutation.error ? <ErrorState message="Recommendation action failed." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {query.data!.recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            isUpdating={updateMutation.isPending && updateMutation.variables?.id === recommendation.id}
            onUpdate={(id, status) => updateMutation.mutateAsync({ id, status }).then(() => undefined)}
          />
        ))}
      </div>
      {query.data!.recommendations.length === 0 ? <p className="text-sm text-slate-500">Generate recommendations to begin.</p> : null}
    </div>
  );
}
