"use server";

import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { print } from "graphql";
import {
  REQUEST_ACCOUNT_DELETION_CODE_MUTATION,
  CONFIRM_ACCOUNT_DELETION_MUTATION,
} from "@/lib/gqlQueries";
import { deleteSession } from "@/lib/session.server";

export async function requestEmailChangeViaProxy(body: {
  newEmail: string;
  currentPassword?: string;
  overwriteAlternate?: boolean;
}): Promise<{ status: string; message: string }> {
  const res = await fetch(`${process.env.FRONTEND_URL ?? "http://localhost:3000"}/api/email-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json as { status: string; message: string };
}

export async function updateProfileViaProxy(body: {
  name?: string;
  bio?: string;
}): Promise<{ id: number; name: string; bio?: string; email: string }> {
  const res = await fetch(`${process.env.FRONTEND_URL ?? "http://localhost:3000"}/api/update-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json;
}

export async function requestAccountDeletionCodeAction(): Promise<{
  success: boolean;
  verifyToken?: string;
  message?: string;
  error?: string;
}> {
  try {
    const data = await authFetchGraphql<{
      requestAccountDeletionCode: {
        success: boolean;
        verifyToken: string;
        message: string;
      };
    }>(print(REQUEST_ACCOUNT_DELETION_CODE_MUTATION));
    const res = data.requestAccountDeletionCode;
    return {
      success: res.success,
      verifyToken: res.verifyToken,
      message: res.message,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to request verification code" };
  }
}

export async function confirmAccountDeletionAction(
  verifyToken: string,
  code: string,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const data = await authFetchGraphql<{
      confirmAccountDeletion: {
        success: boolean;
        message: string;
      };
    }>(print(CONFIRM_ACCOUNT_DELETION_MUTATION), { verifyToken, code });
    const res = data.confirmAccountDeletion;
    return {
      success: res.success,
      message: res.message,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to confirm deletion" };
  }
}

export async function deleteSessionAction() {
  await deleteSession();
}
