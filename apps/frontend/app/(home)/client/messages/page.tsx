import { getSession } from "@/lib/session.server"; // Adjust import path
import { redirect } from "next/navigation";
import ChatWorkspace from "@/components/chat/ChatWorkspace"; // Adjust import path
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClientMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();

  if (!session || !session.accessToken) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const convId = typeof params.convId === "string" ? parseInt(params.convId, 10) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Link
        href="/client"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-deep md:text-3xl">Your Trainers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat with your assigned trainers and schedule your workout routines.
          </p>
        </div>
      </div>

      <ChatWorkspace
        accessToken={session.accessToken}
        currentUserId={Number(session.user.id)}
        initialActiveConvId={convId}
      />
    </div>
  );
}
