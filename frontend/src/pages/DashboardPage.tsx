import { useQuery } from "@tanstack/react-query";
import { Activity, Leaf, Target, TrendingDown } from "lucide-react";
import { ActionPlanWidget } from "../components/dashboard/ActionPlanWidget";
import { CarbonTwinProjectionChart } from "../components/dashboard/CarbonTwinProjectionChart";
import { CategoryBreakdownChart } from "../components/dashboard/CategoryBreakdownChart";
import { MonthlyTrendChart } from "../components/dashboard/MonthlyTrendChart";
import { PlanProgressCard } from "../components/dashboard/PlanProgressCard";
import { RecentActivityList } from "../components/dashboard/RecentActivityList";
import { SummaryMetric } from "../components/dashboard/SummaryMetric";
import { FutureYouSection } from "../components/dashboard/FutureYouSection";
import { BadgePill } from "../components/ui/BadgePill";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { DashboardResponse } from "../types/api";

export function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/overview")
  });

  if (query.isLoading) return <LoadingState message="Loading dashboard" />;
  if (query.error) return <ErrorState message={query.error instanceof Error ? query.error.message : "Dashboard failed to load"} />;

  const dashboard = query.data!.dashboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Where you are now, what to do next, progress made, and the future impact you can create.</p>
      </div>

      <section className="space-y-4" aria-labelledby="where-now">
        <div>
          <h2 id="where-now" className="text-xl font-black text-ink">Where am I now?</h2>
          <p className="text-sm text-slate-600">Your current footprint and the Carbon Twin signal behind it.</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric {...dashboard.widgets.monthlyFootprint} icon={<Activity className="h-5 w-5" aria-hidden="true" />} />
        <SummaryMetric {...dashboard.widgets.baselineComparison} icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />} />
        <SummaryMetric
          title={dashboard.widgets.topCategory.title}
          value={dashboard.widgets.topCategory.value}
          unit={`${dashboard.widgets.topCategory.percentage.toFixed(0)}%`}
          explanation={dashboard.widgets.topCategory.explanation}
          recommendationHint={dashboard.widgets.topCategory.recommendationHint}
          icon={<Leaf className="h-5 w-5" aria-hidden="true" />}
        />
        <SummaryMetric {...dashboard.widgets.estimatedSavings} icon={<Target className="h-5 w-5" aria-hidden="true" />} />
      </div>
      </section>

      <section className="space-y-4" aria-labelledby="next-action">
        <div>
          <h2 id="next-action" className="text-xl font-black text-ink">What should I do next?</h2>
          <p className="text-sm text-slate-600">Make the 30-day plan visible and keep the next action obvious.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <PlanProgressCard {...dashboard.widgets.planProgress} />
          <ActionPlanWidget plan={dashboard.actionPlanPreview} />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="future-impact">
        <div>
          <h2 id="future-impact" className="text-xl font-black text-ink">What future impact can I create?</h2>
          <p className="text-sm text-slate-600">Future You compares today’s emissions with the projected lower-emissions path.</p>
        </div>
        <FutureYouSection {...dashboard.futureYou} />
        <CarbonTwinProjectionChart {...dashboard.charts.carbonTwinProjection} />
      </section>

      <section className="space-y-4" aria-labelledby="progress-made">
        <div>
          <h2 id="progress-made" className="text-xl font-black text-ink">What progress have I made?</h2>
          <p className="text-sm text-slate-600">Your trends, challenges, badges, and recent activity.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <CategoryBreakdownChart data={dashboard.charts.categoryBreakdown} />
          <MonthlyTrendChart {...dashboard.charts.monthlyTrend} />
        </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-bold text-ink">Top Recommendations</h2>
          <div className="mt-4 space-y-3">
            {dashboard.recommendations.length === 0 ? (
              <p className="text-sm text-slate-500">Generate recommendations to see next actions.</p>
            ) : (
              dashboard.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-md bg-emerald-50 p-3">
                  <p className="font-semibold text-ink">{recommendation.title}</p>
                  <p className="text-sm text-slate-600">{Number(recommendation.estimatedSavingsKgCo2e).toFixed(1)} kg CO2e savings</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-ink">Active Challenges</h2>
          <div className="mt-4 space-y-3">
            {dashboard.activeChallenges.length === 0 ? (
              <p className="text-sm text-slate-500">Join a challenge to track progress.</p>
            ) : (
              dashboard.activeChallenges.map((challenge) => (
                <div key={challenge.id} className="rounded-md bg-emerald-50 p-3">
                  <p className="font-semibold text-ink">{challenge.challenge.title}</p>
                  <p className="text-sm text-slate-600">{challenge.progressValue}% complete</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-ink">Recent Badges</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.recentBadges.length === 0 ? (
              <p className="text-sm text-slate-500">Earn badges by completing actions.</p>
            ) : (
              dashboard.recentBadges.map((earned) => <BadgePill key={earned.id} label={earned.badge.name} variant="green" />)
            )}
          </div>
        </Card>
      </div>

      <RecentActivityList entries={dashboard.recentActivity} />
      </section>
    </div>
  );
}
