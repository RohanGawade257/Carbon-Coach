import { useQuery } from "@tanstack/react-query";
import { FutureYouSection } from "../components/dashboard/FutureYouSection";
import { CarbonTwinProjectionChart } from "../components/dashboard/CarbonTwinProjectionChart";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { DashboardResponse } from "../types/api";

export function FutureYouPage() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/overview")
  });

  if (query.isLoading) return <LoadingState message="Loading Future You" />;
  if (query.error) return <ErrorState message="Failed to load Future You data" />;

  const dashboard = query.data!.dashboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Future You</h1>
        <p className="mt-1 text-sm text-slate-600">Compare your monthly baseline with the projected action plan trajectory.</p>
      </div>

      <FutureYouSection {...dashboard.futureYou} />
      <CarbonTwinProjectionChart {...dashboard.charts.carbonTwinProjection} />
    </div>
  );
}
