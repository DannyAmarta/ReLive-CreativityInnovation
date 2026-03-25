import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session.server";
import { BACKEND_URL } from "@/lib/constants";

const UPDATE_PROFILE_QUERY = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      bio
      email
      avatar
      createdAt
    }
  }
`;

// This route proxies the updateProfile GraphQL mutation server-side so the
// httpOnly session cookie can be read to attach the Bearer token securely.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { name?: string; bio?: string };
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
      query: UPDATE_PROFILE_QUERY,
      variables: {
        input: {
          name: body.name,
          bio: body.bio,
        },
      },
    }),
  });

  const json = await res.json();

  if (json?.errors?.length) {
    return NextResponse.json(
      { error: json.errors[0]?.message ?? "GraphQL error" },
      { status: 400 },
    );
  }

  return NextResponse.json(json?.data?.updateProfile ?? {});
}
