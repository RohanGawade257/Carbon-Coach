import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";
import { useToastStore } from "../stores/toastStore";

const initialForm = {
  country: "",
  householdSize: "1",
  homeType: "Apartment",
  dietType: "Mixed diet",
  transportMode: "Car and public transport",
  energySource: "Grid electricity",
  goalReason: ""
};

export function ProfilePage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState(initialForm);

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiRequest<ApiShapes["profile"]>("/profile")
  });

  useEffect(() => {
    if (query.data?.profile) {
      setForm({
        country: query.data.profile.country,
        householdSize: String(query.data.profile.householdSize),
        homeType: query.data.profile.homeType,
        dietType: query.data.profile.dietType,
        transportMode: query.data.profile.transportMode,
        energySource: query.data.profile.energySource,
        goalReason: query.data.profile.goalReason
      });
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("/profile", {
        method: "PUT",
        body: { ...form, householdSize: Number(form.householdSize) }
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["carbonTwin"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast("Profile Saved");
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

  if (query.isLoading) return <LoadingState message="Loading profile" />;
  if (query.error) return <ErrorState message="Profile failed to load" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update the profile that powers Carbon Twin and AI Coach context.</p>
      </div>
      {mutation.error ? <ErrorState message="Profile update failed." /> : null}
      {mutation.isSuccess ? <div className="rounded-md border border-emerald-200 bg-mint p-4 text-sm font-semibold text-forest">Profile saved.</div> : null}
      <Card>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
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
            <Button type="submit" isLoading={mutation.isPending} loadingLabel="Saving...">Save Profile</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
