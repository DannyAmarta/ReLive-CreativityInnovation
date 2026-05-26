import { BACKEND_URL } from "@/lib/constants";
import { createSession } from "@/lib/session.server";
import { decodeJwt } from "jose";
import { NextResponse } from "next/server";

type GoogleExchangeResponse = {
    id: number;
    name: string;
    avatar?: string | null;
    accessToken: string;
};

// This route completes the Google login handoff on the frontend server.
// It is used after the backend redirects back from Google, and it exchanges a short-lived code instead of reading tokens from the URL.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const response = await fetch(`${BACKEND_URL}/auth/google/exchange`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        cache: "no-store",
    });

    if (!response.ok) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const authPayload =
        (await response.json()) as GoogleExchangeResponse;

    let role: string | undefined;
    try {
        const decoded = decodeJwt(authPayload.accessToken);
        if (typeof decoded.role === "string") {
            role = decoded.role;
        }
    } catch {
        // ignore decode errors
    }

    await createSession({
        user: {
            id: String(authPayload.id),
            name: authPayload.name,
            avatar: authPayload.avatar ?? undefined,
            role: role as "USER" | "TRAINER" | "ADMIN" | undefined,
        },
        accessToken: authPayload.accessToken,
    });

    const redirectPath = role === "TRAINER" ? "/trainer" : "/client";
    return NextResponse.redirect(new URL(redirectPath, req.url));
}
