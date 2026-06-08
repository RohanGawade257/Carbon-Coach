import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalculatorForm, CalculatorPayload } from "../components/footprint/CalculatorForm";
import { FootprintEntryList } from "../components/footprint/FootprintEntryList";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";
import { useToastStore } from "../stores/toastStore";

export function CalculatorPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const [estimate, setEstimate] = useState<{ kgCo2e: number; unit: string } | undefined>();
  const [error, setError] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<ApiShapes["categories"]>("/emissions/categories")
  });

  const entriesQuery = useQuery({
    queryKey: ["footprintEntries"],
    queryFn: () => apiRequest<ApiShapes["footprintEntries"]>("/footprint/entries")
  });

  const calculateMutation = useMutation({
    mutationFn: (payload: CalculatorPayload) =>
      apiRequest<{ kgCo2e: number; factor: { unit: string } }>("/footprint/calculate", {
        method: "POST",
        body: {
          categoryId: payload.categoryId,
          activityType: payload.activityType,
          quantity: payload.quantity
        }
    }),
    onSuccess: (data) => setEstimate({ kgCo2e: data.kgCo2e, unit: data.factor.unit }),
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "Calculation failed");
      showToast("Something Went Wrong", "error");
    }
  });

  const createMutation = useMutation({
    mutationFn: (payload: CalculatorPayload) => apiRequest("/footprint/entries", { method: "POST", body: payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["footprintEntries"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["carbonTwin"] })
      ]);
      showToast("Footprint Entry Saved");
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "Save failed");
      showToast("Something Went Wrong", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/footprint/entries/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["footprintEntries"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast("Footprint Entry Deleted");
    },
    onError: () => showToast("Something Went Wrong", "error")
  });

  if (categoriesQuery.isLoading || entriesQuery.isLoading) return <LoadingState message="Loading calculator" />;
  if (categoriesQuery.error || entriesQuery.error) return <ErrorState message="Calculator failed to load" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink">Carbon Calculator</h1>
        <p className="mt-1 text-sm text-slate-600">Calculate and save activity-based emissions.</p>
      </div>
      {error ? <ErrorState message={error} /> : null}
      <CalculatorForm
        categories={categoriesQuery.data!.categories}
        estimate={estimate}
        isCalculating={calculateMutation.isPending}
        isSaving={createMutation.isPending}
        onCalculate={async (payload) => calculateMutation.mutateAsync(payload).then(() => undefined)}
        onSave={async (payload) => createMutation.mutateAsync(payload).then(() => undefined)}
      />
      <FootprintEntryList entries={entriesQuery.data!.entries} onDelete={(id) => deleteMutation.mutateAsync(id).then(() => undefined)} />
    </div>
  );
}
