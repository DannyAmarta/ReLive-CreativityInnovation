"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { print } from "graphql";
import { authFetchGraphql, isAuthenticationGraphqlError } from "../fetchGraphQL";
import { createSession } from "../session.server";
import { CHANGE_MY_ROLE_MUTATION, DEV_REFRESH_SESSION_MUTATION } from "../gqlQueries";

export async function changeRoleAction(formData: FormData) {
  const role = formData.get("role")?.toString();

  if (!role) {
    throw new Error("role is required");
  }

  try {
    await authFetchGraphql(print(CHANGE_MY_ROLE_MUTATION), { role });
    
    // Refresh the session so the warning banner goes away immediately
    const refreshData = (await authFetchGraphql(print(DEV_REFRESH_SESSION_MUTATION))) as any;
    if (refreshData?.devRefreshSession) {
      await createSession({
        user: {
          id: String(refreshData.devRefreshSession.id),
          name: refreshData.devRefreshSession.name,
          avatar: refreshData.devRefreshSession.avatar,
        },
        accessToken: refreshData.devRefreshSession.accessToken,
      });
    }
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      redirect("/dev/change-role?session=expired");
    }

    throw error;
  }

  revalidatePath("/dev/change-role");
  revalidatePath("/trainer");
  revalidatePath("/trainer/bookings");
  revalidatePath("/trainer/services");
  revalidatePath("/trainer/wallet");
  revalidatePath("/client");
  revalidatePath("/client/dashboard");

  redirect("/dev/change-role");
}
