import { SessionWarning } from "@/components/auth/SessionWarning";
import { print } from "graphql";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { GET_ME_QUERY } from "@/lib/gqlQueries";
import { changeRoleAction } from "@/lib/actions/dev";

type MeResponse = {
  getMe: {
    id: number;
    name: string;
    email: string;
    role: "USER" | "TRAINER" | "ADMIN";
  };
};

export default async function ChangeRolePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  let me: MeResponse["getMe"] | null = null;
  let showSessionWarning = params?.session === "expired";

  try {
    const data = await authFetchGraphql<MeResponse>(print(GET_ME_QUERY));
    me = data.getMe;
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      showSessionWarning = true;
    } else {
      throw error;
    }
  }

  const nextRole = me?.role === "TRAINER" ? "USER" : "TRAINER";

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Dev Change Role</h1>
      {showSessionWarning && (
        <div className="mt-4">
          <SessionWarning description="Role switching is disabled until you refresh your Google sign-in. The dev page stays open so you can recover without being kicked out." />
        </div>
      )}
      {me ? (
        <>
          <p className="mt-3 text-sm text-muted-foreground">User: {me.name} ({me.email})</p>
          <p className="mt-1 text-sm text-muted-foreground">Current role: {me.role}</p>

          <form action={changeRoleAction} className="mt-6">
            <input type="hidden" name="role" value={nextRole} />
            <button
              type="submit"
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Switch to {nextRole}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Role data is temporarily unavailable until you sign in again.
        </p>
      )}
    </div>
  );
}
