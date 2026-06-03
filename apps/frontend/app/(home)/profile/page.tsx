import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session.server";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { GET_ME_QUERY } from "@/lib/gqlQueries";
import { print } from "graphql";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export const metadata: Metadata = {
  title: "Profile | ReLive",
  description: "View and manage your ReLive profile.",
};

type GetMeResult = {
  getMe: {
    id: number;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    // --- Add these ---
    profileCompleted: boolean;
    vitalityScore: number;
    fitnessLevel?: string;
    primaryGoal?: string;
    dailyActivity?: string;
    // -----------------
    hasOpenRouterConnection: boolean;
    openRouterKeyLabel?: string | null;
    openRouterConnectedAt?: string | null;
    createdAt?: string;
  };
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  let user: GetMeResult["getMe"] | null = null;

  try {
    // Note: GET_ME_QUERY must be updated in your gqlQueries.ts to include profileCompleted
    const data = await authFetchGraphql<GetMeResult>(print(GET_ME_QUERY));
    user = data?.getMe ?? null;
  } catch {
    redirect("/auth/login");
  }

  if (!user) redirect("/auth/login");

  return (
  <ProfilePageClient
    user={{
      ...user,
      role: session.user.role,
      bio: user.bio,
      avatar: user.avatar ?? null,
      fitnessLevel: user.fitnessLevel ?? null,
      primaryGoal: user.primaryGoal ?? null,
      dailyActivity: user.dailyActivity ?? null, // Add this line here
      openRouterKeyLabel: user.openRouterKeyLabel ?? null,
      
      openRouterConnectedAt: user.openRouterConnectedAt 
        ? new Date(user.openRouterConnectedAt) 
        : null,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    }}
  />
);
}
