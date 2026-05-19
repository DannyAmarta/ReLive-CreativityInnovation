import { SessionWarning } from "@/components/auth/SessionWarning";
import { Sidebar } from "@/components/navigation/Sidebar";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { getSessionState } from "@/lib/session.server";
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
  const sessionState = await getSessionState();
  const session = sessionState.session;
  if (!session) redirect("/auth/login");

  let sessionWarning =
    sessionState.status === "access-token-expired"
      ? "Your Google session expired in the backend. You can keep browsing seed-backed screens for now, but sign in again before saving or updating anything."
      : null;

  // 2. Fetch User Status
  let user = session.user;
  if (sessionState.status === "valid") {
    try {
      const data = await authFetchGraphql<{ getMe: any }>(print(GET_ME_QUERY));
      user = data?.getMe ?? session.user;
    } catch (err) {
      if (isAuthenticationGraphqlError(err)) {
        sessionWarning =
          "Your session is still open in the browser, but the backend asked for a fresh Google sign-in. You can keep browsing temporarily, then sign in again when you are ready.";
      } else {
        console.error("HomeLayout getMe fallback:", err);
      }
    }
  }

  // 3. THE GATEKEEPER
  // If the user exists but hasn't completed their profile,
  // we show ONLY the onboarding, hiding the Sidebar and children.
  if ("profileCompleted" in user && user.profileCompleted === false) {
    return <OnboardingLayout initialUser={user} />;
  }

  // 4. THE NORMAL APP
  return (
    <div className="flex h-screen w-full bg-[#f6f1e7] text-[#233126] font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {sessionWarning && (
          <div className="sticky top-0 z-30 px-4 pt-4 md:px-6">
            <SessionWarning description={sessionWarning} />
          </div>
        )}
        {children}
        <SageChat user={user} /> {/* <--- SAGE LIVES HERE */}
      </main>
    </div>
  );
}
