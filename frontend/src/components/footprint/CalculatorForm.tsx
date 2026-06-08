import { FormEvent, useMemo, useState } from "react";
import { EmissionCategory } from "../../types/domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

export type CalculatorPayload = {
  categoryId: string;
  activityType: string;
  quantity: number;
  occurredAt: string;
  notes?: string;
};

export function CalculatorForm({
  categories,
  estimate,
  isLoading,
  onCalculate,
  onSave
}: {
  categories: EmissionCategory[];
  estimate?: { kgCo2e: number; unit: string };
  isLoading: boolean;
  onCalculate: (payload: CalculatorPayload) => Promise<void>;
  onSave: (payload: CalculatorPayload) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const selectedCategory = useMemo(() => categories.find((category) => category.id === categoryId) ?? categories[0], [categories, categoryId]);
  const [activityType, setActivityType] = useState(selectedCategory?.emissionFactors[0]?.activityType ?? "");
  const [quantity, setQuantity] = useState("10");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function normalizePayload() {
    const parsedQuantity = Number(quantity);
    if (!categoryId || !activityType || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Choose a category, activity, and positive quantity.");
      return null;
    }
    setError("");
    return {
      categoryId,
      activityType,
      quantity: parsedQuantity,
      occurredAt,
      notes: notes.trim() || undefined
    };
  }

  async function handleCalculate(event: FormEvent) {
    event.preventDefault();
    const payload = normalizePayload();
    if (payload) await onCalculate(payload);
  }

  async function handleSave() {
    const payload = normalizePayload();
    if (payload) await onSave(payload);
  }

  function handleCategoryChange(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    const nextCategory = categories.find((category) => category.id === nextCategoryId);
    setActivityType(nextCategory?.emissionFactors[0]?.activityType ?? "");
  }

  return (
    <Card>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCalculate}>
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-ink">Carbon Calculator</h2>
          <p className="mt-1 text-sm text-slate-600">Log everyday activities and turn them into kg CO2e estimates.</p>
        </div>
        <Select
          label="Category"
          value={categoryId}
          onChange={(event) => handleCategoryChange(event.target.value)}
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
        <Select
          label="Activity"
          value={activityType}
          onChange={(event) => setActivityType(event.target.value)}
          options={(selectedCategory?.emissionFactors ?? []).map((factor) => ({
            value: factor.activityType,
            label: `${factor.activityType.replaceAll("_", " ")} (${factor.unit})`
          }))}
        />
        <Input label="Quantity" type="number" min="0" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        <Input label="Date" type="date" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
        <div className="md:col-span-2">
          <Textarea label="Notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
        {error ? <p className="text-sm font-semibold text-red-700 md:col-span-2">{error}</p> : null}
        {estimate ? (
          <div className="rounded-md bg-mint p-4 md:col-span-2">
            <p className="text-sm font-semibold text-forest">Estimated footprint</p>
            <p className="text-3xl font-bold text-ink">{estimate.kgCo2e.toFixed(2)} kg CO2e</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
          <Button type="submit" disabled={isLoading}>
            Calculate
          </Button>
          <Button type="button" variant="secondary" onClick={handleSave} disabled={isLoading}>
            Save Entry
          </Button>
        </div>
      </form>
    </Card>
  );
}

