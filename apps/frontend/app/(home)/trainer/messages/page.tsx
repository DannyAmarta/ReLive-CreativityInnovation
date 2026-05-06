"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { Avatar } from "@/components/trainer/Avatar";
import { EmptyState } from "@/components/trainer/EmptyState";
import {
  conversations as initialConvs,
  messagesByBooking as initialMsgs,
  fmtDateTime,
  fmtRelative,
  type ChatMessage,
} from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [convs, setConvs] = useState(initialConvs);
  const [msgs, setMsgs] = useState<Record<string, ChatMessage[]>>(initialMsgs);
  const [activeId, setActiveId] = useState<string | null>(convs[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  const active = useMemo(() => convs.find((c) => c.id === activeId) ?? null, [convs, activeId]);
  const activeMsgs = active ? msgs[active.bookingId] ?? [] : [];

  const send = () => {
    if (!draft.trim() || !active) return;
    const m: ChatMessage = {
      id: `M${Date.now()}`,
      bookingId: active.bookingId,
      senderId: "trainer",
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    setMsgs((s) => ({ ...s, [active.bookingId]: [...(s[active.bookingId] ?? []), m] }));
    setConvs((cs) => cs.map((c) => (c.id === active.id ? { ...c, lastMessage: m.content, lastMessageAt: m.createdAt } : c)));
    setDraft("");
  };

  const select = (id: string) => {
    setActiveId(id);
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  return (
    <div>
      <PageHeader title="Messages" description="One conversation per booking. Stay in sync with your clients." />

      <div className="glass-card-elevated overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100dvh-260px)] min-h-[500px]">
        {/* Conversation list */}
        <aside className={cn("border-r border-border overflow-y-auto", active && "hidden md:block")}>
          {convs.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No conversations" description="Messages will appear here when bookings come in." />
          ) : (
            <ul>
              {convs.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => select(c.id)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 border-b border-border/60 hover:bg-muted/40 transition-colors flex gap-3",
                      activeId === c.id && "bg-accent/5"
                    )}
                  >
                    <Avatar initials={c.client.avatar} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">{c.client.name}</p>
                        <p className="text-[10px] text-muted-foreground shrink-0">{fmtRelative(c.lastMessageAt)}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-1">{c.serviceTitle}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate flex-1">{c.lastMessage}</p>
                        {c.unread > 0 && <span className="size-2 rounded-full bg-accent shrink-0 animate-pulse-soft" />}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat */}
        <section className={cn("flex flex-col bg-surface", !active && "hidden md:flex")}>
          {!active ? (
            <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a client from the list to start chatting." />
          ) : (
            <>
              <header className="px-5 py-3.5 border-b border-border bg-background flex items-center gap-3">
                <button className="md:hidden size-8 rounded-md hover:bg-muted flex items-center justify-center" onClick={() => setActiveId(null)} aria-label="Back">
                  <ArrowLeft className="size-4" />
                </button>
                <Avatar initials={active.client.avatar} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{active.client.name}</p>
                  <p className="text-[11px] text-muted-foreground">{active.serviceTitle} · {fmtDateTime(active.bookingDate)}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {activeMsgs.map((m) => (
                  <div key={m.id} className={cn("flex", m.senderId === "trainer" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.senderId === "trainer"
                        ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    )}>
                      <p>{m.content}</p>
                      <p className={cn("text-[10px] mt-1", m.senderId === "trainer" ? "opacity-70" : "text-muted-foreground")}>
                        {fmtRelative(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form
                className="p-3 border-t border-border bg-background flex gap-2"
                onSubmit={(e) => { e.preventDefault(); send(); }}
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!draft.trim()} className="bg-gradient-primary text-primary-foreground">
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

