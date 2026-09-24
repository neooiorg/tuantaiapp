import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db";
import * as authSchema from "../db/auth-schema";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        // New accounts (Google/email sign-up) default to the "sales" role.
        before: async (user) => {
          return { data: { ...user, role: "sales" } };
        },
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      // Google sign-in links to an existing member (created by admin) with the same email.
      trustedProviders: ["google"],
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  // RBAC: roles admin/sales/technician/designer.
  // Access-control rules are configured in Phase 2.
  plugins: [admin()],
});
