import { Award, Compass, Leaf, TrendingDown } from "lucide-react";
import { Badge } from "../../types/domain";
import { Card } from "../ui/Card";

const icons = {
  leaf: Leaf,
  compass: Compass,
  "trending-down": TrendingDown,
  award: Award
};

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => {
        const Icon = icons[badge.iconKey as keyof typeof icons] ?? Award;
        const earned = badge.userBadges.length > 0;
        return (
          <Card key={badge.id} className={earned ? "border-forest" : "opacity-65"}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-md ${earned ? "bg-mint text-forest" : "bg-slate-100 text-slate-500"}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-ink">{badge.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{badge.description}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{earned ? "Earned" : "Locked"}</p>
          </Card>
        );
      })}
    </div>
  );
}

