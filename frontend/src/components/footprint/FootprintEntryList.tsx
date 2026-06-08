import { Trash2 } from "lucide-react";
import { FootprintEntry } from "../../types/domain";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function FootprintEntryList({
  entries,
  onDelete
}: {
  entries: FootprintEntry[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-ink">Footprint History</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Date</th>
              <th>Category</th>
              <th>Activity</th>
              <th>Quantity</th>
              <th>CO2e</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="py-3">{new Date(entry.occurredAt).toLocaleDateString()}</td>
                <td>{entry.category.name}</td>
                <td>{entry.activityType.replaceAll("_", " ")}</td>
                <td>
                  {Number(entry.quantity).toFixed(1)} {entry.unit}
                </td>
                <td className="font-bold text-forest">{Number(entry.kgCo2e).toFixed(1)} kg</td>
                <td className="text-right">
                  <Button variant="ghost" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.activityType}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 ? <p className="py-6 text-sm text-slate-500">No entries yet.</p> : null}
      </div>
    </Card>
  );
}

