import { FootprintEntry } from "../../types/domain";
import { Card } from "../ui/Card";

export function RecentActivityList({ entries }: { entries: FootprintEntry[] }) {
  return (
    <Card>
      <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No footprint entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md bg-emerald-50 p-3">
              <div>
                <p className="font-semibold text-ink">{entry.category.name}</p>
                <p className="text-sm text-slate-600">{entry.activityType.replaceAll("_", " ")}</p>
              </div>
              <p className="text-sm font-bold text-forest">{Number(entry.kgCo2e).toFixed(1)} kg</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

