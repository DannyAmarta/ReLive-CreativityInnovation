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
    const data = await authFetchGraphql<GetMeResult>(print(GET_ME_QUERY));
    user = data?.getMe ?? null;
  } catch {
    // Token invalid, expired, or backend unreachable → force re-login
    redirect("/auth/login");
  }

  if (!user) redirect("/auth/login");

  return (
    <ProfilePageClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar ?? null,
        hasOpenRouterConnection: user.hasOpenRouterConnection,
        openRouterKeyLabel: user.openRouterKeyLabel ?? null,
        openRouterConnectedAt: user.openRouterConnectedAt
          ? new Date(user.openRouterConnectedAt)
          : null,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      }}
    />
  );
}
