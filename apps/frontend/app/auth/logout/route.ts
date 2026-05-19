import { deleteSession } from "@/lib/session.server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const next = request.nextUrl.searchParams.get("next") || "/";
    await deleteSession();
    redirect(next);
}
