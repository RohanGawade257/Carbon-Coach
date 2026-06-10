import { forwardRef, KeyboardEvent, useImperativeHandle, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/Button";

export interface ChatInputHandle {
  focus(): void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, {
  disabled?: boolean;
  onSend: (content: string) => Promise<void>;
}>(function ChatInput({ disabled, onSend }, ref) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose the textarea element to the parent (ChatWindow) via ref
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

  // ── Auto-resize textarea as the user types ────────────────────────────────
  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; // cap ~6 rows
  }

  // ── Core send handler ─────────────────────────────────────────────────────
  async function submitMessage() {
    const trimmed = content.trim();
    if (!trimmed || disabled || isSending) return;

    setContent("");
    setIsSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height on clear
    }

    try {
      await onSend(trimmed);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  // ── Enter = send, Shift+Enter = newline ───────────────────────────────────
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  }

  const isDisabled = disabled || isSending;

  return (
    <form
      className="flex items-end gap-2 rounded-2xl border border-emerald-100 bg-white p-2 shadow-soft sm:gap-3 sm:p-3"
      onSubmit={(e) => { e.preventDefault(); void submitMessage(); }}
    >
      <label className="sr-only" htmlFor="chat-message">
        Message Carbon Coach
      </label>

      <textarea
        ref={textareaRef}
        id="chat-message"
        className="focus-ring flex-1 resize-none rounded-xl border border-emerald-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-slate-400 disabled:opacity-50"
        value={content}
        onChange={(e) => { setContent(e.target.value); resizeTextarea(); }}
        onKeyDown={handleKeyDown}
        placeholder="Ask how to reduce your footprint… (Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={isDisabled}
        aria-label="Message Carbon Coach"
      />

      <Button
        type="submit"
        disabled={!content.trim() || isDisabled}
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
});

ChatInput.displayName = "ChatInput";
export { ChatInput };
