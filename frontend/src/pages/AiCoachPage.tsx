import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChatWindow } from "../components/ai/ChatWindow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { apiRequest } from "../lib/apiClient";
import { ApiShapes } from "../types/api";
import { useToastStore } from "../stores/toastStore";

export function AiCoachPage() {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiRequest<ApiShapes["conversations"]>("/ai/conversations")
  });

  const createConversationMutation = useMutation({
    mutationFn: () => apiRequest<{ conversation: { id: string } }>("/ai/conversations", { method: "POST", body: { title: "Sustainability Coaching" } }),
    onSuccess: async (data) => {
      setConversationId(data.conversation.id);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      showToast("New chat started. Ask for your next best action.");
    }
  });

  useEffect(() => {
    if (!conversationId && conversationsQuery.data?.conversations.length) {
      setConversationId(conversationsQuery.data.conversations[0].id);
    }
  }, [conversationId, conversationsQuery.data]);

  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => apiRequest<ApiShapes["conversation"]>(`/ai/conversations/${conversationId}`),
    enabled: Boolean(conversationId)
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => apiRequest<ApiShapes["message"]>(`/ai/conversations/${conversationId}/messages`, { method: "POST", body: { content } }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (data.message.model === "deterministic-fallback") {
        showToast("AI service temporarily unavailable. Using local sustainability insights.", "info");
      }
    }
  });

  if (conversationsQuery.isLoading) return <LoadingState message="Loading AI Coach" />;
  if (conversationsQuery.error) return <ErrorState message="AI Coach failed to load" />;

  const messages = conversationQuery.data?.conversation.messages ?? [];

  return (
    // h-full inherits from AppLayout's flex-1 main column — no hardcoded viewport calc.
    // This means the flex chain (AppLayout → main → AiCoachPage → ChatWindow) is
    // unbroken, and ChatWindow's inner overflow-y-auto actually gets a finite height
    // to overflow against.
    <div className="flex flex-col gap-4 h-full sm:gap-6">
      {/* ── Header row — fixed height, never scrolls ── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end shrink-0">
        <div>
          <h1 className="text-3xl font-black text-ink">AI Coach</h1>
          <p className="mt-1 text-sm text-slate-600">Ask for sustainability guidance powered by your Carbon Twin.</p>
        </div>
        <Button
          variant="secondary"
          isLoading={createConversationMutation.isPending}
          loadingLabel="Starting Chat..."
          onClick={() => createConversationMutation.mutate()}
        >
          New Chat
        </Button>
      </div>

      {/* ── Error banner ── */}
      {sendMutation.error || createConversationMutation.error ? (
        <div className="shrink-0">
          <ErrorState message="AI Coach request failed. Try again." />
        </div>
      ) : null}

      {/* ── Chat area — flex-1 + min-h-0 lets the child overflow-y-auto work ── */}
      <div className="flex-1 min-h-0">
        {!conversationId ? (
          <Card>
            <p className="text-sm text-slate-600">Start a chat to ask Carbon Coach for your next best action.</p>
            <div className="mt-4">
              <Button isLoading={createConversationMutation.isPending} loadingLabel="Starting Chat..." onClick={() => createConversationMutation.mutate()}>Start Chat</Button>
            </div>
          </Card>
        ) : conversationQuery.isLoading ? (
          <LoadingState message="Loading conversation" />
        ) : (
          <ChatWindow
            messages={messages}
            isSending={sendMutation.isPending}
            onSend={(content) => sendMutation.mutateAsync(content).then(() => undefined)}
          />
        )}
      </div>
    </div>
  );
}
