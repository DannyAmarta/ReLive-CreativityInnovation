import { NextResponse } from "next/server";
import { print } from "graphql";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session.server";
import { DISCONNECT_OPENROUTER_MUTATION } from "@/lib/gqlQueries";

export async function POST() {
  const session = await getSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      query: print(DISCONNECT_OPENROUTER_MUTATION),
    }),
  });
  const payload = await response.json();

  if (payload?.errors?.length) {
    return NextResponse.json(
      { error: payload.errors[0]?.message ?? "Unable to disconnect OpenRouter." },
      { status: 400 },
    );
  }

  return NextResponse.json(payload?.data?.disconnectOpenRouter ?? {});
}
