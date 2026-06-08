import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChallengeCard } from "../components/challenges/ChallengeCard";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";
import { useToastStore } from "../stores/toastStore";

export function ChallengesPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const query = useQuery({
    queryKey: ["challenges"],
    queryFn: () => apiRequest<ApiShapes["challenges"]>("/challenges")
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/challenges/${id}/join`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      showToast("Challenge Joined");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, progressValue, status }: { id: string; progressValue: number; status?: "Joined" | "Completed" }) =>
      apiRequest(`/user-challenges/${id}`, { method: "PATCH", body: { progressValue, status } }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      showToast(variables.status === "Completed" ? "Challenge Completed" : "Challenge Progress Updated");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  if (query.isLoading) return <LoadingState message="Loading challenges" />;
  if (query.error) return <ErrorState message="Challenges failed to load" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Challenges</h1>
        <p className="mt-1 text-sm text-slate-600">Complete eco-friendly challenges and earn badges.</p>
      </div>
      {joinMutation.error || progressMutation.error ? <ErrorState message="Challenge action failed." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {query.data!.challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            isJoining={joinMutation.isPending && joinMutation.variables === challenge.id}
            updatingChallengeId={progressMutation.isPending ? progressMutation.variables?.id : undefined}
            onJoin={(id) => joinMutation.mutateAsync(id).then(() => undefined)}
            onProgress={(id, progressValue, status) => progressMutation.mutateAsync({ id, progressValue, status }).then(() => undefined)}
          />
        ))}
      </div>
    </div>
  );
}
