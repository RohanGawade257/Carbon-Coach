import { useQuery } from "@tanstack/react-query";
import { Activity, Award, Flag, Leaf, Target, TrendingDown } from "lucide-react";
import { ActionPlanWidget } from "../components/dashboard/ActionPlanWidget";
import { CarbonTwinProjectionChart } from "../components/dashboard/CarbonTwinProjectionChart";
import { CategoryBreakdownChart } from "../components/dashboard/CategoryBreakdownChart";
import { MonthlyTrendChart } from "../components/dashboard/MonthlyTrendChart";
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
  const journey = dashboard.widgets.planProgress;
  const progression = dashboard.progression ?? {
    score: 300,
    grade: "D",
    level: "Level 1 - Beginner",
    nextLevelTarget: 500,
    nextLevelName: "Conscious Consumer",
    monthlyMission: {
      title: "Reduce Transport Emissions",
      description: "Reduce transport emissions by 10% this month.",
      category: "Transport",
      progress: 0,
      reward: 25,
      completed: false
    },
    futureYouMessages: ["Complete your mission to gain +25 Carbon Score.", "Reach 500 score to become Conscious Consumer."]
  };
  const mission = progression.monthlyMission;
  const missionProgress = Math.min(100, Math.max(0, mission.progress));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Where you are now, what to do next, progress made, and the future impact you can create.</p>
      </div>

      <Card className="space-y-4" id="carbon-score" variant="clay">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-emerald-100 p-3 text-forest animate-pulse">
              <Award className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Carbon Score</p>
              <h2 className="mt-1 text-3xl font-black text-ink">
                {progression.score} <span className="text-lg font-bold text-forest">Grade {progression.grade}</span>
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">{progression.level}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[440px]">
            <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Current Mission</p>
              <p className="mt-1 font-bold text-ink">{mission.title}</p>
              <p className="mt-1 text-sm text-slate-600">{mission.description}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-sky-100 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Next Level Goal</p>
              <p className="mt-1 text-2xl font-black text-skyline">
                {progression.nextLevelTarget ? `${progression.nextLevelTarget} Score` : "Top Level"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {progression.nextLevelName ? `Reach ${progression.nextLevelName}` : "Climate Champion reached"}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <Flag className="h-4 w-4 text-forest" aria-hidden="true" />
              Mission Progress
            </span>
            <span>{missionProgress.toFixed(0)}%</span>
          </div>
          <div className="h-4 rounded-full bg-emerald-100">
            <div className="h-4 rounded-full bg-forest transition-all" style={{ width: `${missionProgress}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-forest">Complete your mission to gain +{mission.reward} Carbon Score.</p>
        </div>
      </Card>

      <Card className="space-y-4" id="carbon-reduction-journey">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-500">Carbon Reduction Journey</p>
            <h2 className="mt-1 text-2xl font-black text-ink">
              {journey.completedDays} / {journey.totalDays || 30} Days Completed
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Completing action-plan days increases your progress and estimated completed savings.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Complete</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.completionPercentage.toFixed(0)}%</p>
            </div>
            <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Estimated Savings</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.estimatedSavingsKgCo2e.toFixed(1)} kg</p>
            </div>
            <div className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Current Streak</p>
              <p className="mt-1 text-2xl font-black text-forest">{journey.currentStreakDays || 0} days</p>
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
        <div>
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
                <div key={recommendation.id} className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
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
                <div key={challenge.id} className="rounded-2xl bg-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),4px_4px_10px_rgba(0,0,0,0.05)] border border-emerald-100 p-3">
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
