import { Trophy } from "lucide-react";
import { Challenge } from "../../types/domain";
import { BadgePill } from "../ui/BadgePill";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ChallengeCard({
  challenge,
  isJoining,
  updatingChallengeId,
  onJoin,
  onProgress
}: {
  challenge: Challenge;
  isJoining?: boolean;
  updatingChallengeId?: string;
  onJoin: (id: string) => Promise<void>;
  onProgress: (userChallengeId: string, progressValue: number, status?: "Joined" | "Completed") => Promise<void>;
}) {
  const userChallenge = challenge.userChallenges[0];
  const progress = userChallenge?.progressValue ?? 0;
  const isUpdating = Boolean(userChallenge && updatingChallengeId === userChallenge.id);

  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-amber-100 p-3 text-amber-900">
          <Trophy className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-ink">{challenge.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{challenge.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <BadgePill label={challenge.category.name} variant="blue" />
        <BadgePill label={challenge.difficulty} variant={challenge.difficulty === "Easy" ? "green" : "amber"} />
        <BadgePill label={`${challenge.points} pts`} variant="neutral" />
        <BadgePill label={`${challenge.durationDays} day${challenge.durationDays === 1 ? "" : "s"}`} variant="neutral" />
      </div>
      {userChallenge ? (
        <div className="space-y-3">
          <div className="h-3 rounded-full bg-emerald-100">
            <div className="h-3 rounded-full bg-forest" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" isLoading={isUpdating} loadingLabel="Updating..." onClick={() => onProgress(userChallenge.id, Math.min(100, progress + 25))}>
              Add Progress
            </Button>
            <Button
              isLoading={isUpdating}
              loadingLabel="Updating..."
              feedbackState={userChallenge.status === "Completed" ? "success" : "idle"}
              successLabel="Completed"
              disabled={userChallenge.status === "Completed"}
              onClick={() => onProgress(userChallenge.id, 100, "Completed")}
            >
              Mark Complete
            </Button>
          </div>
        </div>
      ) : (
        <Button isLoading={isJoining} loadingLabel="Joining..." onClick={() => onJoin(challenge.id)}>
          Join Challenge
        </Button>
      )}
    </Card>
  );
}
