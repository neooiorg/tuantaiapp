// Applies drizzle migrations at container start (production).
// Uses drizzle-orm's migrator + pg (both production deps) so it works without drizzle-kit.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const needsSsl =
  connectionString.includes("sslmode=require") || connectionString.includes("neon.tech");

const pool = new pg.Pool({
  connectionString,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

const db = drizzle(pool);
await migrate(db, { migrationsFolder: "./drizzle" });
await pool.end();
console.log("[migrate] migrations applied");
