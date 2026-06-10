import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Leaf, TreePine, Wind } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

// Animated floating leaf using inline keyframes
const floatKeyframes = `
@keyframes float-leaf {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-14px) rotate(6deg); }
  66%       { transform: translateY(-6px) rotate(-4deg); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.95); opacity: 0.6; }
  50%  { transform: scale(1.05); opacity: 0.2; }
  100% { transform: scale(0.95); opacity: 0.6; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

function FloatingLeaf({
  delay,
  x,
  size,
  opacity,
}: {
  delay: number;
  x: string;
  size: number;
  opacity: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: x,
        top: `${20 + Math.random() * 60}%`,
        animation: `float-leaf ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <Leaf
        style={{ width: size, height: size, color: "#1f7a4d" }}
        strokeWidth={1.5}
      />
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-redirect after 10 s
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigate(token ? "/dashboard" : "/", { replace: true });
    }, 10_000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, token]);

  const badPath = location.pathname;
  const destination = token ? "/dashboard" : "/";
  const destinationLabel = token ? "Dashboard" : "Home";

  return (
    <>
      {/* Inject keyframes once */}
      <style>{floatKeyframes}</style>

      <main
        className="relative min-h-screen overflow-hidden bg-[#f6faf7] flex flex-col items-center justify-center px-4 py-16"
        aria-labelledby="not-found-title"
      >
        {/* ── Background decorations ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {/* Radial glow */}
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(31,122,77,0.08) 0%, transparent 70%)",
            }}
          />
          {/* Floating leaves */}
          <FloatingLeaf delay={0}   x="8%"  size={18} opacity={0.25} />
          <FloatingLeaf delay={1.2} x="15%" size={12} opacity={0.18} />
          <FloatingLeaf delay={0.6} x="80%" size={22} opacity={0.2}  />
          <FloatingLeaf delay={1.8} x="88%" size={14} opacity={0.15} />
          <FloatingLeaf delay={0.3} x="72%" size={10} opacity={0.22} />
          <FloatingLeaf delay={2.1} x="25%" size={16} opacity={0.17} />
        </div>

        {/* ── Card ── */}
        <div
          className="relative z-10 w-full max-w-lg text-center"
          style={{ animation: "fade-up 0.55s ease-out both" }}
        >
          {/* Icon cluster */}
          <div className="relative mx-auto mb-8 w-36 h-36 flex items-center justify-center">
            {/* Pulsing ring */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-2 border-forest/30"
              style={{ animation: "pulse-ring 3s ease-in-out infinite" }}
            />
            {/* Slow-spin ring */}
            <div
              aria-hidden="true"
              className="absolute inset-3 rounded-full border border-dashed border-forest/20"
              style={{ animation: "spin-slow 18s linear infinite" }}
            />
            {/* Core circle */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-forest to-emerald-600 shadow-[0_12px_40px_rgba(31,122,77,0.35)]">
              <TreePine className="h-11 w-11 text-white" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </div>

          {/* 404 number */}
          <p
            aria-hidden="true"
            className="text-[7rem] font-black leading-none tracking-tighter text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #1f7a4d 0%, #34d399 50%, #1f7a4d 100%)",
            }}
          >
            404
          </p>

          {/* Title */}
          <h1
            id="not-found-title"
            className="mt-2 text-2xl font-black text-ink sm:text-3xl"
          >
            Lost in the Carbon Forest
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-slate-500 leading-relaxed max-w-sm mx-auto">
            The page{" "}
            <code className="rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-mono text-forest border border-emerald-200">
              {badPath}
            </code>{" "}
            doesn't exist. Even carbon offsetting can't recover a missing URL.
          </p>

          {/* Auto-redirect notice */}
          <p className="mt-3 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            Redirecting you to {destinationLabel} in 10 seconds…
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={destination}
              id="not-found-primary-btn"
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(31,122,77,0.35)] transition-all hover:bg-emerald-700 hover:shadow-[0_6px_20px_rgba(31,122,77,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go to {destinationLabel}
            </Link>

            <button
              type="button"
              id="not-found-back-btn"
              onClick={() => navigate(-1)}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-mint hover:border-emerald-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </button>
          </div>

          {/* Quick-links */}
          <div className="mt-10 border-t border-emerald-100 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick links
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { to: "/",            label: "Landing"     },
                { to: "/login",       label: "Login"       },
                { to: "/register",    label: "Register"    },
                ...(token
                  ? [
                      { to: "/dashboard",    label: "Dashboard"   },
                      { to: "/calculator",   label: "Calculator"  },
                      { to: "/carbon-twin",  label: "Carbon Twin" },
                      { to: "/ai-coach",     label: "AI Coach"    },
                    ]
                  : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:text-forest"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer brand ── */}
        <div
          className="absolute bottom-6 flex items-center gap-2 text-xs text-slate-400"
          aria-hidden="true"
        >
          <Leaf className="h-3.5 w-3.5 text-emerald-400" />
          <span>Carbon Coach · Calculate. Understand. Reduce.</span>
        </div>
      </main>
    </>
  );
}
