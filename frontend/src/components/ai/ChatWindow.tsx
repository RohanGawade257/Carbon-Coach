import { AiMessage } from "../../types/domain";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

export function ChatWindow({
  messages,
  isSending,
  onSend
}: {
  messages: AiMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<void>;
}) {
  return (
    <section className="flex min-h-[calc(100vh-9rem)] flex-col gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-md bg-emerald-50 p-4">
        {messages.length === 0 ? (
          <div className="rounded-md bg-white p-5 text-sm text-slate-600 shadow-soft">
            Ask Carbon Coach for a practical reduction idea. Your Carbon Twin context will guide the answer.
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        {isSending ? (
          <div className="rounded-md bg-white p-4 text-sm font-semibold text-slate-600 shadow-soft" role="status">
            Carbon Coach is thinking...
          </div>
        ) : null}
      </div>
      <ChatInput disabled={isSending} onSend={onSend} />
    </section>
  );
}

