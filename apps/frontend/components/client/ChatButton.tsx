"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/constants";

export default function ChatButton({
  accessToken,
  initialUnreadCount = 0,
}: {
  accessToken: string;
  initialUnreadCount?: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const socketRef = useRef<Socket | null>(null);

  const fetchUnreadCount = useCallback(() => {
    if (!accessToken) return;
    fetch(`${BACKEND_URL}/messaging/conversations/unread-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(console.error);
  }, [accessToken]);

  // Sync state if initialUnreadCount prop changes
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Set up WebSocket to listen for unread count changes
  useEffect(() => {
    if (!accessToken) return;

    socketRef.current = io(BACKEND_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socketRef.current.on("new_message_alert", () => {
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current.on("messages_read", () => {
      fetchUnreadCount();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken, fetchUnreadCount]);

  return (
    <Link
      href="/client/messages"
      className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center z-50"
    >
      <MessageSquare size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-neutral-900 animate-pulse-soft">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
