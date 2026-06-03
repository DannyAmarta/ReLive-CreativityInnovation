import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";
import { getSession } from "@/lib/session.server";

const REMEMBER_WALLET_ACCOUNT_MUTATION = `
  mutation RememberWalletAccount($provider: String!, $walletAddress: String!, $setActive: Boolean) {
    rememberWalletAccount(provider: $provider, walletAddress: $walletAddress, setActive: $setActive)
  }
`;

const MY_WALLET_ACCOUNTS_QUERY = `
  query MyWalletAccounts {
    getMe {
      walletAddress
    }
    myWalletAccounts {
      id
      provider
      walletAddress
      isActive
      lastUsedAt
      createdAt
    }
  }
`;

export async function GET() {
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
      query: MY_WALLET_ACCOUNTS_QUERY,
    }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload?.errors?.length) {
    return NextResponse.json(
      { error: payload?.errors?.[0]?.message ?? "Unable to load wallet accounts" },
      { status: response.status || 500 },
    );
  }

  return NextResponse.json({
    savedWalletAddress: payload?.data?.getMe?.walletAddress ?? null,
    walletAccounts: payload?.data?.myWalletAccounts ?? [],
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as {
    provider?: string;
    walletAddress?: string;
    setActive?: boolean;
  };

  if (!body.provider || !body.walletAddress) {
    return NextResponse.json({ error: "provider and walletAddress are required" }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      query: REMEMBER_WALLET_ACCOUNT_MUTATION,
      variables: {
        provider: body.provider,
        walletAddress: body.walletAddress,
        setActive: body.setActive ?? true,
      },
    }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload?.errors?.length) {
    return NextResponse.json(
      { error: payload?.errors?.[0]?.message ?? "Unable to save wallet account" },
      { status: response.status || 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
