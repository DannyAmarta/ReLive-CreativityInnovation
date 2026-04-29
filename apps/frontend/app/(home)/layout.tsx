import { Sidebar } from "@/components/navigation/Sidebar";
import { getSession } from "@/lib/session.server";
import { redirect } from "next/navigation";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { GET_ME_QUERY } from "@/lib/gqlQueries";
import { print } from "graphql";
import { OnboardingLayout } from "@/components/profile/onboarding/OnboardingLayout";
import { SageChat } from "@/components/chat/SageChat";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Check Session
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // 2. Fetch User Status
  let user;
  try {
    const data = await authFetchGraphql(print(GET_ME_QUERY));
    user = data?.getMe;
  } catch (err) {
    redirect("/auth/login");
  }

  // 3. THE GATEKEEPER
  // If the user exists but hasn't completed their profile,
  // we show ONLY the onboarding, hiding the Sidebar and children.
  if (user && !user.profileCompleted) {
    return <OnboardingLayout initialUser={user} />;
  }

  // 4. THE NORMAL APP
  return (
    <div className="flex h-screen w-full bg-[#F7F9F7] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {children}
        <SageChat user={user} /> {/* <--- SAGE LIVES HERE */}
      </main>
    </div>
  );
}