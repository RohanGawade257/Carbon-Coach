import { useCallback, useEffect, useRef } from "react";
import { AiMessage } from "../../types/domain";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

// ─── Scroll-proximity threshold ───────────────────────────────────────────────
// If the user is within this many pixels of the bottom, we consider them
// "at the bottom" and auto-scroll is allowed. If they have scrolled further
// up than this, they are intentionally reading history — we leave them alone.
const SCROLL_THRESHOLD_PX = 120;

export function ChatWindow({
  messages,
  isSending,
  onSend,
}: {
  messages: AiMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  // Ref for the scrollable message list container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sentinel element placed after the last message — we scrollIntoView this
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Track whether the user has manually scrolled away from the bottom.
  // We use a ref (not state) so updating it never triggers a re-render.
  const userScrolledUpRef = useRef(false);

  // ── Detect when the user manually scrolls away from the bottom ────────────
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // If they are more than SCROLL_THRESHOLD_PX from the bottom, they have
    // scrolled up intentionally — respect their position.
    userScrolledUpRef.current = distanceFromBottom > SCROLL_THRESHOLD_PX;
  }, []);

  // ── Helper: scroll to bottom (smooth) ────────────────────────────────────
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomAnchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // ── Auto-scroll on page load (instant, no animation) ─────────────────────
  // Runs once on mount so the user always lands at the latest message.
  useEffect(() => {
    scrollToBottom("instant");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll when messages change or isSending changes ─────────────────
  // Covers: user sends a message, AI reply arrives.
  // Skipped if the user has scrolled up intentionally.
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages, isSending, scrollToBottom]);

  // ── Public API exposed to ChatInput: scroll unconditionally after send ─────
  // When the user explicitly presses Send / Enter, always scroll to bottom
  // regardless of where they were (even if they had scrolled up to quote an
  // old message before replying).
  const handleSend = useCallback(
    async (content: string) => {
      userScrolledUpRef.current = false; // reset — user just sent, go to bottom
      await onSend(content);
    },
    [onSend]
  );

  return (
    <section className="flex flex-col gap-3 h-[calc(100vh-10rem)] min-h-[400px] sm:h-[calc(100vh-9rem)]">
      {/* ── Scrollable message list ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain space-y-4 rounded-2xl bg-emerald-50 p-3 sm:p-4 scroll-smooth"
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

        {/* "Thinking" indicator — appears inline at the bottom of messages */}
        {isSending ? (
          <div
            className="flex gap-3 items-start"
            role="status"
            aria-label="Carbon Coach is thinking"
          >
            {/* Bot avatar — matches ChatMessage assistant style */}
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mint text-forest">
              <span className="text-base" aria-hidden="true">🤖</span>
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

        {/* Invisible sentinel — scrollIntoView target */}
        <div ref={bottomAnchorRef} aria-hidden="true" />
      </div>

      {/* ── Input bar ── */}
      <ChatInput disabled={isSending} onSend={handleSend} />
    </section>
  );
}
