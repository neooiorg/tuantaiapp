import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { getCurrentUser } from "@/server/auth/session";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  country: string | null;
  bio: string | null;
};

// Loads the full profile row for the currently authenticated user, or null.
export async function getCurrentProfile(): Promise<Profile | null> {
  const current = await getCurrentUser();
  if (!current) return null;

  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      website: user.website,
      address: user.address,
      country: user.country,
      bio: user.bio,
    })
    .from(user)
    .where(eq(user.id, current.id))
    .limit(1);

  return row ?? null;
}
