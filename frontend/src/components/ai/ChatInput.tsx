import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/Button";

export function ChatInput({ disabled, onSend }: { disabled?: boolean; onSend: (content: string) => Promise<void> }) {
  const [content, setContent] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setContent("");
    await onSend(trimmed);
  }

  return (
    <form className="flex gap-3 rounded-md border border-emerald-100 bg-white p-3 shadow-soft" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chat-message">
        Message Carbon Coach
      </label>
      <textarea
        id="chat-message"
        className="focus-ring min-h-11 flex-1 resize-none rounded-md border border-emerald-200 px-3 py-2 text-sm"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Ask how to reduce your footprint this week..."
        rows={1}
        disabled={disabled}
      />
      <Button type="submit" isLoading={disabled} loadingLabel="Sending..." disabled={disabled || !content.trim()} aria-label="Send message">
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
