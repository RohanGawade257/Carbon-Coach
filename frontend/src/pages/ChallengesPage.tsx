import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Trophy, Users } from "lucide-react";
import { ChallengeCard } from "../components/challenges/ChallengeCard";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";
import { useToastStore } from "../stores/toastStore";

const GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500"
];

export function ChallengesPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  const query = useQuery({
    queryKey: ["challenges"],
    queryFn: () => apiRequest<ApiShapes["challenges"]>("/challenges")
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiRequest<ApiShapes["leaderboard"]>("/users/leaderboard")
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/challenges/${id}/join`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["badges"] });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      showToast("Challenge joined. Progress tracking started.");
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
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      showToast(variables.status === "Completed" ? "Challenge completed. Badge progress refreshed." : `Challenge progress updated to ${variables.progressValue}%.`);
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  if (query.isLoading || leaderboardQuery.isLoading) return <LoadingState message="Loading challenges and leaderboard" />;
  if (query.error || leaderboardQuery.error) return <ErrorState message="Failed to load page data" />;

  const leaderboardList = leaderboardQuery.data?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Challenges & Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-600">Complete eco-friendly challenges, earn badges, and climb the local leaderboard.</p>
      </div>

      {joinMutation.error || progressMutation.error ? <ErrorState message="Challenge action failed." /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Challenges list */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Trophy className="h-5 w-5 text-forest" />
            Active Challenges
          </h2>
          <div className="grid gap-4 sm:grid-cols-1">
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

        {/* Leaderboard list */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Users className="h-5 w-5 text-forest" />
            Local Leaderboard
          </h2>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="divide-y divide-slate-100">
              {leaderboardList.map((peer) => {
                const grad = GRADIENTS[peer.displayName.length % GRADIENTS.length];
                return (
                  <div
                    key={peer.id}
                    className={`flex items-center gap-3 py-3 transition-colors ${
                      peer.isCurrentUser 
                        ? "bg-emerald-50/70 border border-emerald-200 rounded-xl px-2.5 -mx-1" 
                        : ""
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black">
                      {peer.rank === 1 ? (
                        <span className="text-lg">🥇</span>
                      ) : peer.rank === 2 ? (
                        <span className="text-lg">🥈</span>
                      ) : peer.rank === 3 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        <span className="text-slate-400">#{peer.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-xs font-bold text-white shadow-sm`}>
                      {peer.avatarSeed}
                    </div>

                    {/* Name & details */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${peer.isCurrentUser ? "text-forest" : "text-ink"}`}>
                        {peer.displayName} {peer.isCurrentUser && <span className="ml-1 text-[10px] bg-forest text-white px-1.5 py-0.5 rounded-full font-normal">You</span>}
                      </p>
                      <p className="text-xs text-slate-400">{peer.entriesCount} activities logged</p>
                    </div>

                    {/* Streak & Score */}
                    <div className="flex items-center gap-3 text-right">
                      {peer.currentStreak > 0 && (
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600" title={`${peer.currentStreak} day streak`}>
                          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>{peer.currentStreak}d</span>
                        </div>
                      )}
                      <div className="text-sm font-bold text-ink whitespace-nowrap">
                        {peer.carbonScore} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {leaderboardList.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  No players registered yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
