import { getSession } from "@/lib/session.server";
import ClientShell from "@/components/client/ClientShell";
import { getMyNotifications } from "@/lib/actions/notifications";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user ?? { name: "Client" };
  const notifications = await getMyNotifications();

  return <ClientShell user={user} initialNotifications={notifications}>{children}</ClientShell>;
}
