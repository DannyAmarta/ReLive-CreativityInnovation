import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getSession } from "@/lib/session.server";
import prisma from "@/lib/prisma";

export default async function MessagesWidget() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  // Find up to 3 most recent conversations that have unread messages sent by the other user
  const unreadConvs = await prisma.conversation.findMany({
    where: {
      OR: [{ trainerUserId: userId }, { clientUserId: userId }],
      messages: {
        some: {
          senderId: { not: userId },
          isRead: false,
        },
      },
    },
    include: {
      trainerUser: { select: { id: true, name: true, avatar: true } },
      clientUser: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    take: 3,
  });

  return (
    <div className="glass-card-elevated p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-primary-deep flex items-center gap-2">
          <MessageSquare size={18} className="text-[#4a5d3e]" />
          Recent Unread Chats
        </h3>
        <Link
          href="/trainer/messages"
          className="text-xs text-[#4a5d3e] hover:text-[#3B4A32] font-bold transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {unreadConvs.map((conv) => {
          const partner =
            conv.trainerUserId === userId ? conv.clientUser : conv.trainerUser;
          const latestMessage = conv.messages[0];

          return (
            <Link
              key={conv.id}
              href="/trainer/messages"
              className="flex items-center gap-3 p-2.5 hover:bg-[#E2E9D9]/30 hover:border-[#58784a]/12 border border-transparent rounded-xl transition-all text-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center font-bold text-primary-deep group-hover:border-[#4a5d3e] transition-colors flex-shrink-0">
                {partner.name ? partner.name.charAt(0) : "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-primary-deep truncate">
                  {partner.name}
                </p>
                <p className="text-[#4a5d3e]/70 truncate text-xs mt-0.5">
                  {latestMessage?.content || "Sent a message"}
                </p>
              </div>
              <span className="w-2 h-2 bg-terracotta-500 rounded-full flex-shrink-0 animate-pulse-soft"></span>
            </Link>
          );
        })}

        {unreadConvs.length === 0 && (
          <div className="py-6 text-center text-xs text-sage-600/70 flex flex-col items-center justify-center gap-2">
            <svg
              className="w-8 h-8 text-sage-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              ></path>
            </svg>
            <span>No unread messages</span>
          </div>
        )}
      </div>
    </div>
  );
}
