import { getSession } from "@/lib/session.server";
import { redirect } from "next/navigation";

export default async function MessagesRedirectPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const role = session.user?.role;
  if (role === "TRAINER") {
    redirect("/trainer");
  } else {
    redirect("/client");
  }
}
