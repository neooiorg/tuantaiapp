import { headers } from "next/headers";
import { isAppRole, type AppRole } from "@/lib/permissions";
import { auth } from ".";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole | null;
};

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Returns the current user with a validated app role, or null.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const rawRole = (session.user as { role?: unknown }).role;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: isAppRole(rawRole) ? rawRole : null,
  };
}

// Throws if there is no authenticated user with a recognized app role.
export async function requireUser(): Promise<SessionUser & { role: AppRole }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!user.role) throw new Error("NO_ROLE");
  return { ...user, role: user.role };
}
