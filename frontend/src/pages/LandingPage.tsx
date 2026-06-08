import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiCoachSection } from "../components/landing/AiCoachSection";
import { CarbonTwinSection } from "../components/landing/CarbonTwinSection";
import { HeroSection } from "../components/landing/HeroSection";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { ImpactMetricsSection } from "../components/landing/ImpactMetricsSection";
import { ProblemSection } from "../components/landing/ProblemSection";
import { TryDemoSection } from "../components/landing/TryDemoSection";
import { ErrorState } from "../components/ui/ErrorState";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";

export function LandingPage() {
  const demoLogin = useAuthStore((state) => state.demoLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const showToast = useToastStore((state) => state.showToast);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleDemo() {
    try {
      setError("");
      await demoLogin();
      showToast("Demo Account Loaded");
      navigate("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Demo mode failed to start");
      showToast("Something Went Wrong", "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      {error ? (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
          <ErrorState message={error} />
        </div>
      ) : null}
      <HeroSection onDemo={handleDemo} loading={isLoading} />
      <ProblemSection />
      <HowItWorksSection />
      <CarbonTwinSection />
      <AiCoachSection />
      <ImpactMetricsSection />
      <TryDemoSection onDemo={handleDemo} loading={isLoading} />
    </div>
  );
}
