import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PlanPage } from "./pages/PlanPage";
import { FutureYouPage } from "./pages/FutureYouPage";
import { CalculatorPage } from "./pages/CalculatorPage";
import { CarbonTwinPage } from "./pages/CarbonTwinPage";
import { AiCoachPage } from "./pages/AiCoachPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { BadgesPage } from "./pages/BadgesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ToastViewport } from "./components/ui/ToastViewport";
import { GoogleTranslate } from "./components/ui/GoogleTranslate";

export default function App() {
  const hydrateMe = useAuthStore((state) => state.hydrateMe);
  const location = useLocation();

  useEffect(() => {
    void hydrateMe();
  }, [hydrateMe]);

  useEffect(() => {
    if (!location.hash) return;
    window.setTimeout(() => {
      const target = document.querySelector(location.hash);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [location]);

  return (
    <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/30-day-plan" element={<PlanPage />} />
          <Route path="/future-you" element={<FutureYouPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/carbon-twin" element={<CarbonTwinPage />} />
          <Route path="/ai-coach" element={<AiCoachPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <GoogleTranslate />
    <ToastViewport />
    </>
  );
}
