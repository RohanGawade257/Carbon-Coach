import { useQuery } from "@tanstack/react-query";
import { BadgeGrid } from "../components/badges/BadgeGrid";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";

export function BadgesPage() {
  const query = useQuery({
    queryKey: ["badges"],
    queryFn: () => apiRequest<ApiShapes["badges"]>("/badges/me")
  });

  if (query.isLoading) return <LoadingState message="Loading badges" />;
  if (query.error) return <ErrorState message="Badges failed to load" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Badges</h1>
        <p className="mt-1 text-sm text-slate-600">Achievements for onboarding, challenges, recommendations, and action progress.</p>
      </div>
      <BadgeGrid badges={query.data!.badges} />
    </div>
  );
}

