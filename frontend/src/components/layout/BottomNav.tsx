import { Award, Bot, CalendarCheck, Gauge, MoreHorizontal, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const bottomLinks = [
  { to: "/dashboard", label: "Home", icon: Gauge },
  { to: "/carbon-twin", label: "Twin", icon: Award },
  { to: "/30-day-plan", label: "Plan", icon: CalendarCheck },
  { to: "/ai-coach", label: "Coach", icon: Bot },
  { to: "/challenges", label: "Explore", icon: Trophy },
];

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
    >
      <div className="border-t border-white/40 bg-white/85 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
          {bottomLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  isActive ? "text-forest" : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`rounded-xl p-1.5 transition-colors ${
                      isActive ? "bg-emerald-50" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </motion.div>
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More — opens full sidebar drawer */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Open full navigation menu"
          >
            <div className="rounded-xl p-1.5">
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-semibold leading-none">More</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
