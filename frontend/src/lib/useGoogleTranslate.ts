import { useCallback, useEffect, useState } from "react";
import type { GoogleTranslateConfig, SupportedLanguageCode } from "../types/translate";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "carbon-coach-lang";
const DEFAULT_LANG: SupportedLanguageCode = "en";
const GT_SCRIPT_URL =
  "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
const GT_ELEMENT_ID = "google_translate_element";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Google Translate reads a `googtrans` cookie to decide which language to apply
 * on page load.  Format: /sourceLanguage/targetLanguage
 */
function setGoogTransCookie(targetLang: string): void {
  const value = targetLang === "en" ? "/en/en" : `/en/${targetLang}`;
  // Set on the root path so it is visible to all pages
  document.cookie = `googtrans=${value};path=/`;
  // Some browsers also need the domain-scoped version
  document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
}

function readLangFromStorage(): SupportedLanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguageCode | null;
    return stored ?? DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

// ─── Trigger GT language programmatically ────────────────────────────────────
function triggerGoogleTranslation(targetLang: string): void {
  try {
    const select = document.querySelector<HTMLSelectElement>(
      ".goog-te-combo"
    );
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event("change"));
    }
  } catch {
    // Silently ignore — translation still applied via cookie on next load
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseGoogleTranslateReturn {
  /** True once the GT script has loaded and the widget is ready */
  isReady: boolean;
  /** Currently active language code */
  currentLang: SupportedLanguageCode;
  /** Call this to switch language — persists to localStorage + cookie */
  setLanguage: (code: SupportedLanguageCode) => void;
}

export function useGoogleTranslate(): UseGoogleTranslateReturn {
  const [isReady, setIsReady] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguageCode>(
    readLangFromStorage
  );

  // ── Script + widget initialisation (runs once globally) ──────────────────
  useEffect(() => {
    // Guard: already initialised (handles React StrictMode double-invoke)
    if (window.__gtInitialized) {
      setIsReady(true);
      return;
    }

    try {
      // Expose the callback the GT script calls once loaded
      window.googleTranslateElementInit = () => {
        try {
          const config: GoogleTranslateConfig = {
            pageLanguage: "en",
            autoDisplay: false,
            multilanguagePage: false,
          };
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new window.google!.translate!.TranslateElement(config, GT_ELEMENT_ID);
          window.__gtInitialized = true;
          setIsReady(true);

          // Restore persisted language after widget is ready
          const saved = readLangFromStorage();
          if (saved !== DEFAULT_LANG) {
            // Small delay to let the widget finish attaching its DOM
            setTimeout(() => triggerGoogleTranslation(saved), 600);
          }
        } catch {
          // Widget failed to init — app continues in English
          setIsReady(true);
        }
      };

      // Inject the GT script only once
      if (!document.getElementById("gt-script")) {
        const script = document.createElement("script");
        script.id = "gt-script";
        script.src = GT_SCRIPT_URL;
        script.async = true;
        script.onerror = () => {
          // CDN unreachable — mark ready so UI still works
          setIsReady(true);
        };
        document.head.appendChild(script);
      }
    } catch {
      // Any unexpected error — fall through gracefully
      setIsReady(true);
    }
  }, []); // intentionally empty — run once

  // ── Public setter ─────────────────────────────────────────────────────────
  const setLanguage = useCallback((code: SupportedLanguageCode) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
      setGoogTransCookie(code);
      setCurrentLang(code);
      triggerGoogleTranslation(code);
    } catch {
      // localStorage blocked (private mode etc.) — cookie still set
    }
  }, []);

  // ── Apply cookie on mount (before widget ready) for instant restore ───────
  useEffect(() => {
    const saved = readLangFromStorage();
    if (saved !== DEFAULT_LANG) {
      setGoogTransCookie(saved);
    }
  }, []);

  return { isReady, currentLang, setLanguage };
}
