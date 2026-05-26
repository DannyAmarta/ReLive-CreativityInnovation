"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/constants";

export interface ChatMessage {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  isRead: boolean;
  createdAt: string;
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "AUDIO";
  imageUrl?: string;
  fileUrl?: string;
}

export interface Conversation {
  id: number;
  trainerUserId: number;
  clientUserId: number;
  lastMessageAt: string | null;
  trainerUser: { id: number; name: string; avatar?: string };
  clientUser: { id: number; name: string; avatar?: string };
}

export function useChat(accessToken: string, currentUserId?: number, currentConversationId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [onlineStatuses, setOnlineStatuses] = useState<
    Record<number, "online" | "away" | "offline">
  >({});
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Reset pagination state when conversation changes
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
  }, [currentConversationId]);

  // Initialize Socket Connection
  useEffect(() => {
    if (!accessToken) return;

    socketRef.current = io(BACKEND_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => setIsConnected(true));
    socketRef.current.on("disconnect", () => setIsConnected(false));

    // Listen for initial active statuses mapping
    socketRef.current.on(
      "initial_statuses",
      (statuses: { userId: number; status: "online" | "away" }) => {
        if (Array.isArray(statuses)) {
          const map: Record<number, "online" | "away" | "offline"> = {};
          statuses.forEach((item) => {
            map[item.userId] = item.status;
          });
          setOnlineStatuses(map);
        }
      },
    );

    // Listen for real-time presence updates
    socketRef.current.on("user_status", ({ userId, status }) => {
      setOnlineStatuses((prev) => ({
        ...prev,
        [userId]: status,
      }));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken]);

  // Join specific conversation room when selected
  useEffect(() => {
    if (!socketRef.current || !currentConversationId) return;

    socketRef.current.emit("join_conversation", currentConversationId);

    // Setup conversation-specific listeners
    const handleNewMessage = (msg: ChatMessage) => {
      console.log("WebSocket new_message received:", msg);
      if (msg.conversationId === currentConversationId) {
        setMessages((prev) => [msg, ...prev]);
        // Send read receipt if we are currently looking at this conversation and the message is from the partner
        if (currentUserId && Number(msg.senderId) !== Number(currentUserId)) {
          socketRef.current?.emit("read_messages", {
            conversationId: currentConversationId,
          });
        }
      }
    };

    const handleTyping = ({
      userId,
      isTyping,
    }: {
      userId: number;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) =>
        isTyping
          ? Array.from(new Set([...prev, userId]))
          : prev.filter((id) => id !== userId),
      );
    };

    const handleMessagesRead = ({
      conversationId,
      userId,
    }: {
      conversationId: number;
      userId: number;
    }) => {
      console.log("WebSocket messages_read received:", { conversationId, userId, currentConversationId });
      if (conversationId === currentConversationId) {
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            Number(msg.senderId) !== Number(userId) ? { ...msg, isRead: true } : msg,
          );
          console.log("Updated messages in handleMessagesRead. Previous state:", prev.map(m => ({ id: m.id, content: m.content, isRead: m.isRead })), "New state:", updated.map(m => ({ id: m.id, content: m.content, isRead: m.isRead })));
          return updated;
        });
      }
    };

    socketRef.current.on("new_message", handleNewMessage);
    socketRef.current.on("typing", handleTyping);
    socketRef.current.on("messages_read", handleMessagesRead);

    return () => {
      socketRef.current?.off("new_message", handleNewMessage);
      socketRef.current?.off("typing", handleTyping);
      socketRef.current?.off("messages_read", handleMessagesRead);
    };
  }, [currentConversationId]);

  const sendMessage = useCallback(
    (content: string, type: "TEXT" | "IMAGE" | "FILE" = "TEXT", imageUrl?: string, fileUrl?: string) => {
      if (socketRef.current && currentConversationId && (content.trim() || imageUrl || fileUrl)) {
        socketRef.current.emit("send_message", {
          conversationId: currentConversationId,
          content,
          type,
          imageUrl,
          fileUrl,
        });
      }
    },
    [currentConversationId],
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && currentConversationId) {
        socketRef.current.emit("typing", {
          conversationId: currentConversationId,
          isTyping,
        });
      }
    },
    [currentConversationId],
  );

  const emitStatus = useCallback((status: "online" | "away" | "offline") => {
    if (socketRef.current) {
      socketRef.current.emit("update_status", { status });
    }
  }, []);

  const markAsRead = useCallback(() => {
    if (socketRef.current && currentConversationId) {
      socketRef.current.emit("read_messages", {
        conversationId: currentConversationId,
      });
      // Call REST read endpoint to sync with db and clear unread metrics
      fetch(
        `${BACKEND_URL}/messaging/conversations/${currentConversationId}/read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ).catch(console.error);
    }
  }, [currentConversationId, accessToken]);

  const loadMore = useCallback(async () => {
    if (
      !currentConversationId ||
      isLoadingMore ||
      !hasMore ||
      messages.length === 0
    ) {
      return;
    }

    setIsLoadingMore(true);
    const oldestMessageId = messages[messages.length - 1].id;

    try {
      const res = await fetch(
        `${BACKEND_URL}/messaging/conversations/${currentConversationId}/history?cursor=${oldestMessageId}&take=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length < 50) {
          setHasMore(false);
        }
        setMessages((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Failed to load more chat history:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentConversationId, messages, hasMore, isLoadingMore, accessToken]);

  return {
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
  };
}
