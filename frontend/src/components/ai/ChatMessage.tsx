import { Bot, User } from "lucide-react";
import { AiMessage } from "../../types/domain";

export function ChatMessage({ message }: { message: AiMessage }) {
  const isAssistant = message.role === "assistant";
  const content = isAssistant
    ? message.content.replace(/^Using local sustainability insights:\s*/i, "")
    : message.content;

  return (
    <article className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant ? (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mint text-forest">
          <Bot className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <div className={`max-w-[82%] rounded-md p-4 text-sm leading-6 ${isAssistant ? "bg-white text-ink shadow-soft" : "bg-forest text-white"}`}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      {!isAssistant ? (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-100 text-skyline">
          <User className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
    </article>
  );
}

