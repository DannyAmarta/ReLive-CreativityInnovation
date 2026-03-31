import { NextRequest, NextResponse } from "next/server";
import { print } from "graphql";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session.server";
import { EXCHANGE_OPENROUTER_CODE_MUTATION } from "@/lib/gqlQueries";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { code?: string; verifier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      query: print(EXCHANGE_OPENROUTER_CODE_MUTATION),
      variables: {
        input: {
          code: body.code,
          verifier: body.verifier,
        },
      },
    }),
  });
  const payload = await response.json();

  if (payload?.errors?.length) {
    return NextResponse.json(
      { error: payload.errors[0]?.message ?? "Unable to connect OpenRouter." },
      { status: 400 },
    );
  }

  return NextResponse.json(payload?.data?.exchangeOpenRouterCode ?? {});
}
