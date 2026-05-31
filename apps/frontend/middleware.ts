import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/logout",
  "/",           // landing page
  "/home5",
  "/home6",
  "/home7",
];

// Static-asset and API prefixes to skip entirely
const SKIP_PREFIXES = ["/_next", "/favicon", "/api"];

function isPublic(pathname: string): boolean {
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  return false;
}

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET_KEY ?? "");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes
  if (isPublic(pathname)) return NextResponse.next();

  const sessionCookie = req.cookies.get("session")?.value;

  // No cookie at all → redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // Verify the session cookie signature and expiry
    await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return NextResponse.next();
  } catch {
    // Cookie present but invalid or expired → clear it and redirect
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.set("session", "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
