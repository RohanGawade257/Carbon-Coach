import { Award, Bot, Calculator, CalendarCheck, Gauge, Lightbulb, Medal, Sparkles, Star, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/carbon-twin", label: "Carbon Twin", icon: Star },
  { to: "/30-day-plan", label: "30-Day Plan", icon: CalendarCheck },
  { to: "/future-you", label: "Future You", icon: Sparkles },
  { to: "/ai-coach", label: "AI Coach", icon: Bot },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/badges", label: "Achievements", icon: Medal },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 border-r border-white/30 bg-white/80 backdrop-blur-md p-4 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-md">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-bold text-ink">Carbon Coach</p>
            <p className="text-xs text-slate-500">Calculate. Understand. Reduce.</p>
          </div>
        </div>

        {/* Nav links */}
        <nav aria-label="Primary navigation" className="space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-mint text-forest shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-forest"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Backdrop — mobile only */}
      {open && (
        <button
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
}
