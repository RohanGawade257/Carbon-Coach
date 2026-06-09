import { LogOut, Menu, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../stores/authStore";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button className="focus-ring rounded-md p-2 lg:hidden" type="button" onClick={onMenuClick} aria-label="Open navigation">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-sm text-slate-500">Carbon Coach</p>
            <h1 className="text-base font-bold text-ink">Welcome, {user?.displayName ?? "friend"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border cursor-default transition-all ${
                user.currentStreak > 0 
                  ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" 
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              <Flame className={`h-4 w-4 ${user.currentStreak > 0 ? "fill-amber-500 text-amber-500 animate-pulse" : "text-slate-400"}`} />
              <span>{user.currentStreak ?? 0} Day{user.currentStreak === 1 ? "" : "s"}</span>
            </motion.div>
          )}

          {user && typeof user.carbonScore === "number" && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-forest border border-emerald-200 shadow-sm cursor-default"
            >
              <span>🏆</span>
              <span>{user.carbonScore} pts</span>
            </motion.div>
          )}

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}



