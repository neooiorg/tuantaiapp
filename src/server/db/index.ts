import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

// Enable SSL for managed providers (e.g. Neon); a self-hosted Postgres on the
// internal Docker network (Dokploy) connects without SSL.
const needsSsl =
  connectionString.includes("sslmode=require") || connectionString.includes("neon.tech");

// Reuse a single pool across HMR reloads in development.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool);
