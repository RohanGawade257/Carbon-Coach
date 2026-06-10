import { KeyboardEvent, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/Button";

export function ChatInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-resize textarea height as user types ──────────────────────────────
  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";                          // reset
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; // grow, cap at ~6 rows
  }

  // ── Core send logic ────────────────────────────────────────────────────────
  async function submitMessage() {
    const trimmed = content.trim();
    if (!trimmed || disabled || isSending) return;

    setContent("");
    setIsSending(true);

    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSend(trimmed);
    } finally {
      setIsSending(false);
      // Return focus to the input after the response arrives
      textareaRef.current?.focus();
    }
  }

  // ── Keyboard handler: Enter = send, Shift+Enter = newline ─────────────────
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevent the browser from inserting a newline
      event.preventDefault();
      void submitMessage();
    }
    // Shift+Enter falls through — browser inserts \n normally
  }

  const isDisabled = disabled || isSending;
  const canSend = content.trim().length > 0 && !isDisabled;

  return (
    <form
      className="flex items-end gap-2 rounded-2xl border border-emerald-100 bg-white p-2 shadow-soft sm:gap-3 sm:p-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submitMessage();
      }}
    >
      <label className="sr-only" htmlFor="chat-message">
        Message Carbon Coach
      </label>

      <textarea
        ref={textareaRef}
        id="chat-message"
        className="
          focus-ring
          flex-1 resize-none rounded-xl border border-emerald-200
          bg-slate-50 px-3 py-2.5
          text-sm leading-6 text-ink
          placeholder:text-slate-400
          transition-[height] duration-100
          disabled:opacity-50
        "
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          resizeTextarea();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask how to reduce your footprint… (Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={isDisabled}
        aria-label="Message Carbon Coach"
        aria-multiline="true"
      />

      <Button
        type="submit"
        disabled={!canSend}
        isLoading={isSending}
        loadingLabel=""
        aria-label="Send message"
        className="shrink-0 self-end"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Send</span>
      </Button>
    </form>
  );
}
