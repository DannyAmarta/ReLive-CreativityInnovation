import { getSession } from "@/lib/session.server";
import TrainerShell from "@/components/trainer/TrainerShell";
import { getMyNotifications } from "@/lib/actions/notifications";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session?.user ?? { name: "Trainer" };
  const notifications = await getMyNotifications();

  return <TrainerShell user={user} accessToken={session?.accessToken} initialNotifications={notifications}>{children}</TrainerShell>;
}
