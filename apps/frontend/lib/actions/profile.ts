export async function requestEmailChangeViaProxy(body: {
  newEmail: string;
  currentPassword?: string;
  overwriteAlternate?: boolean;
}): Promise<{ status: string; message: string }> {
  const res = await fetch("/api/email-change", {
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
  const res = await fetch("/api/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json;
}
