"use server";

import { decodeJwt, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export type SessionUser = {
    id?: string | number;
    name?: string;
    avatar?: string;
    role?: 'USER' | 'TRAINER' | 'ADMIN';
};

export type Session = {
    user: SessionUser;
    accessToken: string;
};

export type SessionState = {
    session: Session | null;
    status: "valid" | "access-token-expired" | "missing" | "invalid";
    accessTokenExpiryDate: Date | null;
};

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);
const sessionCookieMaxAgeHours = Number(process.env.SESSION_COOKIE_MAX_AGE_HOURS ?? 24 * 7);
const SESSION_COOKIE_MAX_AGE_MS =
    (Number.isFinite(sessionCookieMaxAgeHours) && sessionCookieMaxAgeHours > 0
        ? sessionCookieMaxAgeHours
        : 24 * 7) *
    60 *
    60 *
    1000;

// This function creates the encrypted session cookie used by the frontend.
// It is used after login and Google OAuth completion so the browser never needs to manage the raw JWT itself.
export async function createSession(payload: Session) {
    const sessionExpiryDate = new Date(Date.now() + SESSION_COOKIE_MAX_AGE_MS);

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

// This function reads the encrypted session cookie and reports whether the backend access token is still fresh.
// It is used by authenticated frontend code so pages can warn before forcing a fresh login.
export async function getSessionState(): Promise<SessionState> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session")?.value;
    if (!cookie) {
        return {
            session: null,
            status: "missing",
            accessTokenExpiryDate: null,
        };
    }

    try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
            algorithms: ["HS256"],
        });
        const session = payload as Session;
        const accessTokenExpiryDate = getAccessTokenExpiryDate(session.accessToken);

        // Extract role from accessToken so layouts can gate UI without extra queries
        let role: 'USER' | 'TRAINER' | 'ADMIN' | undefined;
        try {
            const decoded = decodeJwt(session.accessToken);
            if (decoded.role === 'USER' || decoded.role === 'TRAINER' || decoded.role === 'ADMIN') {
                role = decoded.role;
            }
        } catch { /* ignore decode errors */ }

        return {
            session: {
                ...session,
                user: { ...session.user, role },
            },
            status: isAccessTokenExpired(session.accessToken)
                ? "access-token-expired"
                : "valid",
            accessTokenExpiryDate,
        };
    } catch {
        return {
            session: null,
            status: "invalid",
            accessTokenExpiryDate: null,
        };
    }
}

// This function returns only the session payload for existing callers.
// It is used when route code only needs the user/token and can handle stale auth separately.
export async function getSession() {
    const sessionState = await getSessionState();
    return sessionState.session;
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
