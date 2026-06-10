import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, Check, ChevronDown } from "lucide-react";
import { useGoogleTranslate } from "../../lib/useGoogleTranslate";
import type { LanguageOption, SupportedLanguageCode } from "../../types/translate";

// ─── Language catalogue ───────────────────────────────────────────────────────
// To add a new language: append one entry here — no other file needs changing.
export const LANGUAGES: LanguageOption[] = [
  { code: "en",    label: "English",    nativeLabel: "English"    },
  { code: "hi",    label: "Hindi",      nativeLabel: "हिंदी"       },
  { code: "mr",    label: "Marathi",    nativeLabel: "मराठी"      },
  { code: "kok",   label: "Konkani",    nativeLabel: "कोंकणी"     },
  { code: "es",    label: "Spanish",    nativeLabel: "Español"    },
  { code: "fr",    label: "French",     nativeLabel: "Français"   },
  { code: "de",    label: "German",     nativeLabel: "Deutsch"    },
  { code: "pt",    label: "Portuguese", nativeLabel: "Português"  },
  { code: "ja",    label: "Japanese",   nativeLabel: "日本語"      },
  { code: "zh-CN", label: "Chinese",    nativeLabel: "中文"        },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface LanguageSwitcherProps {
  /**
   * "light" (default) — for Navbar and auth pages (light backgrounds)
   * "dark"            — for HeroSection and other dark surfaces
   */
  variant?: "light" | "dark";
  /** Extra Tailwind classes on the wrapper */
  className?: string;
}

// ─── Variant style maps ───────────────────────────────────────────────────────
const triggerStyles = {
  light:
    "bg-white/70 backdrop-blur-md border border-emerald-200/60 text-ink hover:bg-white hover:border-emerald-300 shadow-sm",
  dark:
    "bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:border-white/50",
};

const dropdownStyles = {
  light: "bg-white border border-emerald-100 shadow-xl",
  dark:  "bg-[#13201a]/95 border border-white/20 shadow-2xl backdrop-blur-xl",
};

const itemBaseStyles = {
  light: "text-ink hover:bg-emerald-50 hover:text-forest",
  dark:  "text-white/90 hover:bg-white/10 hover:text-white",
};

const activeItemStyles = {
  light: "bg-mint text-forest",
  dark:  "bg-white/15 text-white",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LanguageSwitcher({ variant = "light", className = "" }: LanguageSwitcherProps) {
  const { currentLang, setLanguage } = useGoogleTranslate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang: LanguageOption =
    LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSelect = useCallback(
    (code: SupportedLanguageCode) => {
      setLanguage(code);
      setOpen(false);
    },
    [setLanguage]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Trigger button ── */}
      <button
        id="language-switcher-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${activeLang.label}. Click to change.`}
        onClick={() => setOpen((prev) => !prev)}
        className={`
          focus-ring
          inline-flex items-center gap-1.5
          rounded-xl px-3 py-1.5
          text-sm font-semibold
          transition-all duration-200
          ${triggerStyles[variant]}
        `}
      >
        <Globe2
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{activeLang.nativeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className={`
            absolute right-0 z-50 mt-2
            w-48 rounded-2xl
            overflow-hidden
            ${dropdownStyles[variant]}
            animate-in
          `}
          style={{
            animation: "lang-drop-in 0.15s ease-out both",
          }}
        >
          <ul className="max-h-72 overflow-y-auto py-1.5 scrollbar-thin">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(lang.code)}
                    className={`
                      w-full text-left
                      flex items-center justify-between
                      px-3.5 py-2.5
                      text-sm font-medium
                      transition-colors duration-150
                      ${isActive ? activeItemStyles[variant] : itemBaseStyles[variant]}
                    `}
                  >
                    <span className="flex flex-col leading-tight">
                      <span>{lang.nativeLabel}</span>
                      <span
                        className={`text-[11px] font-normal ${
                          variant === "dark" ? "text-white/50" : "text-slate-400"
                        }`}
                      >
                        {lang.label}
                      </span>
                    </span>
                    {isActive && (
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          variant === "dark" ? "text-emerald-300" : "text-forest"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
