"use server";

import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
    id?: string | number;
    name?: string;
    avatar?: string;
};

export type Session = {
    user: SessionUser;
    accessToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

// This function creates the encrypted session cookie used by the frontend.
// It is used after login and Google OAuth completion so the browser never needs to manage the raw JWT itself.
export async function createSession(payload: Session) {
    const accessTokenExpiryDate = getAccessTokenExpiryDate(payload.accessToken);
    const sessionExpiryDate =
        accessTokenExpiryDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(sessionExpiryDate)
        .sign(encodedKey);

    (await cookies()).set("session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: sessionExpiryDate,
        sameSite: "lax",
        path: "/",
    });
}

// This function reads and verifies the encrypted session cookie.
// It is used by authenticated frontend code before it forwards the access token to the backend.
export async function getSession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    if (!cookie) return null;

    try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
            algorithms: ["HS256"],
        });
        const session = payload as Session;

        if (isAccessTokenExpired(session.accessToken)) {
            await deleteSession();
            redirect("/auth/login");
        }

        return session;
    } catch {
        await deleteSession();
        redirect("/auth/login");
    }
}

// This function removes the current session cookie.
// It is used by logout flows and whenever the app needs to clear an invalid session.
export async function deleteSession() {
    (await cookies()).delete("session");
}

function getAccessTokenExpiryDate(accessToken: string) {
    try {
        const decoded = decodeJwt(accessToken);

        if (typeof decoded.exp !== "number") {
            return null;
        }

        return new Date(decoded.exp * 1000);
    } catch {
        return null;
    }
}

function isAccessTokenExpired(accessToken: string) {
    const expiryDate = getAccessTokenExpiryDate(accessToken);

    if (!expiryDate) {
        return true;
    }

    return expiryDate.getTime() <= Date.now();
}
