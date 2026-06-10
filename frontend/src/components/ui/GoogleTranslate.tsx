import { useGoogleTranslate } from "../../lib/useGoogleTranslate";

/**
 * GoogleTranslate
 *
 * Mounts the hidden `<div id="google_translate_element">` that the Google
 * Translate script attaches its internal widget to, and initialises the hook
 * so the script is injected exactly once.
 *
 * Render this component ONCE at the App root level.
 * The div is visually hidden; our own <LanguageSwitcher> provides the UI.
 */
export function GoogleTranslate() {
  // Calling the hook here ensures the script is injected globally from the
  // very first render, regardless of which page is visited first.
  useGoogleTranslate();

  return (
    <div
      id="google_translate_element"
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}
    />
  );
}
