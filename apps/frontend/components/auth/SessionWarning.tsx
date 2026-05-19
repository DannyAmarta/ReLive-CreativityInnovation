import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function SessionWarning({
  title = "Session needs refresh",
  description = "Your Google sign-in is no longer trusted by the backend. You can keep browsing temporary data, but sign in again before making changes.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-[1.4rem] border border-[rgba(199,122,90,0.28)] bg-[rgba(255,246,238,0.96)] px-4 py-4 text-[#6d3f2b] shadow-[0_14px_28px_rgba(199,122,90,0.08)]">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(199,122,90,0.14)] text-[#b35d3b]">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#8a5a46]">{description}</p>
        </div>
      </div>
      <Link
        href="/auth/logout?next=/auth/login"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[rgba(179,93,59,0.2)] bg-white px-4 text-sm font-semibold text-[#8b4d34] transition-colors hover:bg-[rgba(255,252,249,0.95)]"
      >
        Sign in again
      </Link>
    </div>
  );
}
