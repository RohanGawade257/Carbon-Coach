import { useCallback, useEffect, useRef } from "react";
import { AiMessage } from "../../types/domain";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

// ─── How many px from the bottom counts as "at the bottom" ───────────────────
const NEAR_BOTTOM_PX = 120;

export function ChatWindow({
  messages,
  isSending,
  onSend,
}: {
  messages: AiMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  const listRef    = useRef<HTMLDivElement>(null);   // the scrollable message list
  const inputRef   = useRef<HTMLTextAreaElement>(null); // textarea inside ChatInput
  const userUpRef  = useRef(false);                  // true = user scrolled away from bottom

  // ── Scroll the message list (not the page) to its very bottom ────────────
  // We set scrollTop directly on the element we own — this is immune to the
  // scrollIntoView() DOM-walk that accidentally scrolls the AppLayout column.
  const scrollToBottom = useCallback((instant = false) => {
    const el = listRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // ── Detect intentional upward scroll ─────────────────────────────────────
  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    userUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > NEAR_BOTTOM_PX;
  }, []);

  // ── On first real render of messages: scroll instantly + focus input ──────
  // This fires whenever messages.length transitions (e.g. 0→N on data load)
  // and also on mount when messages are already present.
  const didScrollOnce = useRef(false);
  useEffect(() => {
    if (messages.length === 0) return;
    // Always snap to bottom on the very first render of a conversation
    if (!didScrollOnce.current) {
      didScrollOnce.current = true;
      scrollToBottom(true);          // instant — no animation on page load
      inputRef.current?.focus();     // focus the composer immediately
    }
  }, [messages.length, scrollToBottom]);

  // ── Auto-scroll when new messages / typing indicator changes ─────────────
  // Skip if the user is reading history.
  useEffect(() => {
    if (userUpRef.current) return;   // user scrolled up — respect their position
    scrollToBottom(false);           // smooth for arriving messages
  }, [messages, isSending, scrollToBottom]);

  // ── On send: always snap to bottom, reset the "scrolled up" flag ─────────
  const handleSend = useCallback(async (content: string) => {
    userUpRef.current = false;
    scrollToBottom(true);
    await onSend(content);
  }, [onSend, scrollToBottom]);

  return (
    // h-full fills whatever height the parent flex-1 min-h-0 container gives us.
    // No hardcoded calc() here — the budget is set once in AiCoachPage.
    <section className="flex flex-col h-full gap-3">

      {/* ── Scrollable message list ── */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 rounded-2xl bg-emerald-50 p-3 sm:p-4"
        aria-label="Conversation history"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="rounded-xl bg-white p-5 text-sm text-slate-600 shadow-soft">
            Ask Carbon Coach for a practical reduction idea. Your Carbon Twin
            context will guide the answer.
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {/* Typing indicator — inline at the bottom of the message list */}
        {isSending ? (
          <div
            className="flex gap-3 items-start"
            role="status"
            aria-label="Carbon Coach is thinking"
          >
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mint text-forest text-base">
              🤖
            </div>
            <div className="rounded-md bg-white px-4 py-3 text-sm text-slate-500 shadow-soft flex items-center gap-2">
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </span>
              <span>Carbon Coach is thinking…</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Composer — never scrolls away, always visible ── */}
      <div className="shrink-0">
        <ChatInput ref={inputRef} disabled={isSending} onSend={handleSend} />
      </div>
    </section>
  );
}
