import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/server/profile/queries";
import { AccountForm } from "./_components/account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return <AccountForm profile={profile} />;
}
