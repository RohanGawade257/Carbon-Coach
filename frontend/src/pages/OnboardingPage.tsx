import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { apiRequest } from "../lib/apiClient";
import { useToastStore } from "../stores/toastStore";

export function OnboardingPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState({
    country: "United States",
    householdSize: "2",
    homeType: "Apartment",
    dietType: "Mixed diet",
    transportMode: "Car and public transport",
    energySource: "Grid electricity",
    goalReason: "Reduce my monthly carbon footprint with practical everyday changes"
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/profile", {
        method: "PUT",
        body: { ...form, householdSize: Number(form.householdSize) }
      });
      return apiRequest<{ usedLocalInsights?: boolean }>("/carbon-twin/build", { method: "POST" });
    },
    onSuccess: (data) => {
      showToast(
        data.usedLocalInsights
          ? "AI service temporarily unavailable. Using local sustainability insights."
          : "Carbon Twin updated. Dashboard insights refreshed.",
        data.usedLocalInsights ? "info" : "success"
      );
      navigate("/dashboard");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <h1 className="text-3xl font-black text-ink">Build your sustainability profile</h1>
          <p className="mt-2 text-sm text-slate-600">Carbon Twin uses this profile plus your footprint entries to personalize recommendations.</p>
          {mutation.error ? <div className="mt-4"><ErrorState message={mutation.error instanceof Error ? mutation.error.message : "Onboarding failed"} /></div> : null}
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <Input label="Country" value={form.country} onChange={(event) => update("country", event.target.value)} required />
            <Input label="Household size" type="number" min="1" max="20" value={form.householdSize} onChange={(event) => update("householdSize", event.target.value)} required />
            <Select label="Home type" value={form.homeType} onChange={(event) => update("homeType", event.target.value)} options={["Apartment", "House", "Shared housing", "Dorm"].map((value) => ({ value, label: value }))} />
            <Select label="Diet type" value={form.dietType} onChange={(event) => update("dietType", event.target.value)} options={["Mixed diet", "Vegetarian", "Vegan", "High protein", "Mostly plant-forward"].map((value) => ({ value, label: value }))} />
            <Select label="Transport mode" value={form.transportMode} onChange={(event) => update("transportMode", event.target.value)} options={["Car and public transport", "Mostly car", "Mostly public transport", "Walk or bike", "Remote worker"].map((value) => ({ value, label: value }))} />
            <Select label="Energy source" value={form.energySource} onChange={(event) => update("energySource", event.target.value)} options={["Grid electricity", "Renewable plan", "Natural gas", "Mixed sources"].map((value) => ({ value, label: value }))} />
            <div className="sm:col-span-2">
              <Textarea label="Your goal" rows={3} value={form.goalReason} onChange={(event) => update("goalReason", event.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={mutation.isPending} loadingLabel="Building Carbon Twin...">Save and Build Carbon Twin</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
