import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session.server";
import { BACKEND_URL } from "@/lib/constants";
import { print } from "graphql";
import { REQUEST_EMAIL_CHANGE_MUTATION } from "@/lib/gqlQueries";

// This route acts as a secure proxy for the requestEmailChange GraphQL mutation.
// It reads the httpOnly session cookie server-side to extract the access token,
// which cannot be accessed from client-side JavaScript.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    newEmail: string;
    currentPassword?: string;
    overwriteAlternate?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      query: print(REQUEST_EMAIL_CHANGE_MUTATION),
      variables: {
        input: {
          newEmail: body.newEmail,
          currentPassword: body.currentPassword,
          overwriteAlternate: body.overwriteAlternate,
        },
      },
    }),
  });

  const json = await res.json();

  console.log("FULL BACKEND RESPONSE:", JSON.stringify(json, null, 2));
  
  if (json?.errors?.length) {
    return NextResponse.json(
      { error: json.errors[0]?.message ?? "GraphQL error" },
      { status: 400 },
    );
  }

  return NextResponse.json(json?.data?.requestEmailChange ?? {});
}
