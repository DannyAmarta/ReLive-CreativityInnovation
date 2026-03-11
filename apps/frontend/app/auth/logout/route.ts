import { deleteSession } from "@/lib/session.server";
import { redirect } from "next/navigation";

export async function GET(){
    await deleteSession();
    redirect("/")
}