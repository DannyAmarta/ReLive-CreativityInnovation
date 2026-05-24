"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, Conversation } from "@/hooks/use-chat";
import { BACKEND_URL } from "@/lib/constants";

interface ChatWorkspaceProps {
  accessToken: string;
  currentUserId: number;
  initialActiveConvId?: number;
}

export default function ChatWorkspace({
  accessToken,
  currentUserId,
  initialActiveConvId,
}: ChatWorkspaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(
    initialActiveConvId || null
  );
  const [inputText, setInputText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    setMessages,
    isConnected,
    onlineStatuses,
    typingUsers,
    sendMessage,
    emitTyping,
    emitStatus,
    markAsRead,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useChat(accessToken, activeConvId || undefined);

  // Sync initialActiveConvId if it changes
  useEffect(() => {
    if (initialActiveConvId) {
      setActiveConvId(initialActiveConvId);
    }
  }, [initialActiveConvId]);

  // Fetch conversations list on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/messaging/conversations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setConversations(data);
        }
      })
      .catch(console.error);
  }, [accessToken]);

  // Fetch history when a conversation is selected
  useEffect(() => {
    if (!activeConvId) return;

    fetch(`${BACKEND_URL}/messaging/conversations/${activeConvId}/history`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(console.error);
  }, [activeConvId, accessToken, setMessages]);

  // Mark as read when active conversation changes or new messages arrive
  useEffect(() => {
    if (activeConvId) {
      markAsRead();
    }
  }, [activeConvId, messages.length, markAsRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    emitTyping(e.target.value.length > 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // In flex-col-reverse, scrollTop increases negatively when scrolling up (visually towards older messages)
    const isAtTop =
      Math.abs(target.scrollTop) + target.clientHeight >=
      target.scrollHeight - 10;
    if (isAtTop && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activePartner = activeConv
    ? activeConv.trainerUserId === currentUserId
      ? activeConv.clientUser
      : activeConv.trainerUser
    : null;

  const activePartnerStatus = activePartner
    ? onlineStatuses[activePartner.id] || "offline"
    : "offline";

  return (
    <div className="flex h-[calc(100vh-140px)] glass-card-elevated bg-[#FDFBF7]/90 border border-[#58784a]/15 rounded-2xl overflow-hidden text-[#233126] shadow-elevated">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-[#58784a]/12 flex flex-col bg-[#F9F4EA]/60">
        <div className="p-4 border-b border-[#58784a]/12 flex flex-col gap-2 bg-[#F9F4EA]/80">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base text-primary-deep tracking-tight">Chats</h2>
            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
              isConnected 
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/50" 
                : "text-rose-700 bg-rose-50 border-rose-200/50 animate-pulse"
            }`}>
              {isConnected ? "Connected" : "Reconnecting"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#4a5d3e] font-semibold">My Status:</span>
            <select
              value={onlineStatuses[currentUserId] || "online"}
              onChange={(e) => emitStatus(e.target.value as any)}
              className="bg-white border border-[#58784a]/20 rounded-xl px-2 py-1 text-xs text-primary-deep focus:outline-none focus:border-sage-400 cursor-pointer shadow-sm font-medium"
            >
              <option value="online">🟢 Online</option>
              <option value="away">🟡 Away</option>
              <option value="offline">🔴 Offline</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-[#58784a]/10">
          {conversations.map((conv) => {
            const partner =
              conv.trainerUserId === currentUserId
                ? conv.clientUser
                : conv.trainerUser;
            const status = onlineStatuses[partner.id] || "offline";
            const isActive = activeConvId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 transition-all flex items-center gap-3 border-l-4 active:scale-[0.99] ${
                  isActive
                    ? "bg-[#E2E9D9]/50 border-l-[#C77A5A] text-primary-deep font-semibold shadow-sm"
                    : "border-l-transparent hover:bg-[#F2F6ED]/40 text-primary-deep/80"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-white border border-[#58784a]/18 flex items-center justify-center font-bold text-sm text-[#4a5d3e] shadow-sm">
                    {partner.name ? partner.name.charAt(0) : "U"}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                      status === "online"
                        ? "bg-emerald-500"
                        : status === "away"
                          ? "bg-amber-500"
                          : "bg-zinc-400"
                    }`}
                  ></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-sm truncate ${isActive ? "font-bold text-primary-deep" : "font-semibold text-primary-deep/90"}`}>
                      {partner.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#4a5d3e]/70 truncate capitalize font-medium">
                    {status}
                  </p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-xs text-[#4a5d3e]/60 font-medium">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#FDFBF7]">
        {activeConvId ? (
          <>
            {/* Active Partner Info Header */}
            <div className="p-4 border-b border-[#58784a]/12 bg-[#F9F4EA]/80 backdrop-blur-sm flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white border border-[#58784a]/18 flex items-center justify-center font-bold text-sm text-[#4a5d3e] shadow-sm">
                  {activePartner?.name ? activePartner.name.charAt(0) : "U"}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                    activePartnerStatus === "online"
                      ? "bg-emerald-500"
                      : activePartnerStatus === "away"
                        ? "bg-amber-500"
                        : "bg-zinc-400"
                  }`}
                ></span>
              </div>
              <div>
                <p className="font-bold text-sm text-primary-deep">{activePartner?.name}</p>
                <p className="text-[10px] text-[#4a5d3e]/70 capitalize font-bold tracking-wider">
                  {activePartnerStatus}
                </p>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3.5 bg-[#FDFBF7]/40"
            >
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-gradient-to-br from-[#4A5D3E] to-[#6E7E52] text-white rounded-tr-none"
                          : "bg-white border border-[#58784a]/12 text-primary-deep rounded-tl-none"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-normal whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[9px] ${
                        isMe ? "text-white/80" : "text-primary-deep/50"
                      }`}>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <span className="font-medium">
                            {msg.isRead ? "✓✓ Read" : "✓ Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoadingMore && (
                <div className="text-center py-2 text-xs text-neutral-400 animate-pulse">
                  Loading older messages...
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 &&
              typingUsers.some((id) => id !== currentUserId) && (
                <div className="px-4 py-2 text-[11px] text-sage-600 bg-sage-50/40 border-t border-sage-100/50 italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce delay-200"></span>
                  typing...
                </div>
              )}

            {/* Input Area */}
            <div className="p-4 bg-[#F9F4EA]/80 border-t border-[#58784a]/12">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-white border border-[#58784a]/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-400 text-primary-deep placeholder-[#4a5d3e]/40 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || !isConnected}
                  className="bg-[#4A5D3E] hover:bg-[#3B4A32] text-[#f6f1e7] disabled:opacity-40 disabled:hover:bg-[#4A5D3E] px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#4a5d3e]/70 bg-[#FDFBF7] gap-3 p-8 text-center">
            <svg
              className="w-12 h-12 text-[#58784a]/30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 1.127 1.127 0 00.947 1.787 10.224 10.224 0 002.61-.34c.48-.12.974.07 1.344.42a8.884 8.884 0 005.163 1.488z"
              ></path>
            </svg>
            <h3 className="font-bold text-base text-primary-deep tracking-tight mt-1">ReLive Chat</h3>
            <p className="text-xs text-[#4a5d3e]/60 max-w-xs leading-relaxed">
              Select a conversation from the list to view history and start typing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
