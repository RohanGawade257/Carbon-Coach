import { Award, Bot, Calculator, CalendarCheck, Gauge, Lightbulb, Medal, Sparkles, Star, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/carbon-twin", label: "Carbon Twin", icon: Star },
  { to: "/dashboard#plan-progress", label: "30-Day Plan", icon: CalendarCheck },
  { to: "/dashboard#future-you", label: "Future You", icon: Sparkles },
  { to: "/ai-coach", label: "AI Coach", icon: Bot },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/badges", label: "Achievements", icon: Medal },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/profile", label: "Profile", icon: User }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-emerald-100 bg-white p-4 transition lg:sticky lg:top-0 lg:z-auto lg:block lg:h-screen ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-forest text-white">
            <Award className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-ink">Carbon Coach</p>
            <p className="text-xs text-slate-500">Calculate. Understand. Reduce.</p>
          </div>
        </div>
        <nav aria-label="Primary navigation" className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-mint text-forest" : "text-slate-700 hover:bg-emerald-50"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open ? <button className="fixed inset-0 z-20 bg-black/30 lg:hidden" type="button" aria-label="Close navigation" onClick={onClose} /> : null}
    </>
  );
}
