import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

