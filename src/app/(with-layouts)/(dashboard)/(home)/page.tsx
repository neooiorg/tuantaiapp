import { redirect } from "next/navigation";

// This is a CRM app — the root route sends users to the CRM dashboard.
// The CRM layout handles auth (redirects to /login when unauthenticated).
export default function Home() {
  redirect("/crm/dashboard");
}
