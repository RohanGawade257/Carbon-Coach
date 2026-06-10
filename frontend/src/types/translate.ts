// ─── Supported language codes ────────────────────────────────────────────────
export type SupportedLanguageCode =
  | "en"
  | "hi"
  | "mr"
  | "kok"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ja"
  | "zh-CN";

// ─── Language option shape ────────────────────────────────────────────────────
export interface LanguageOption {
  /** BCP-47 language code understood by Google Translate */
  code: SupportedLanguageCode;
  /** English display name */
  label: string;
  /** Native script label shown in the dropdown */
  nativeLabel: string;
}

// ─── Google Translate widget config ──────────────────────────────────────────
export interface GoogleTranslateConfig {
  pageLanguage: string;
  includedLanguages?: string;
  layout?: number;
  autoDisplay?: boolean;
  multilanguagePage?: boolean;
}

// ─── Window augmentation for google.translate namespace ──────────────────────
export interface GoogleTranslateElement {
  new (config: GoogleTranslateConfig, elementId: string): void;
  InlineLayout: {
    SIMPLE: number;
    HORIZONTAL: number;
    VERTICAL: number;
  };
}

declare global {
  interface Window {
    /** Initialisation callback expected by the GT script */
    googleTranslateElementInit?: () => void;
    /** Guard flag — true once the script+widget have been initialised */
    __gtInitialized?: boolean;
    google?: {
      translate?: {
        TranslateElement: GoogleTranslateElement;
      };
    };
  }
}
