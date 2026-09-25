// Applies drizzle migrations at container start (production), then optionally
// promotes a bootstrap admin. Uses drizzle-orm's migrator + pg (production deps).
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
console.log("[migrate] migrations applied");

// Bootstrap admin: promote a known email to admin (idempotent, only if the user exists).
// Non-fatal — a bootstrap issue must never stop the app from starting.
const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
if (adminEmail) {
  try {
    const res = await pool.query(
      `UPDATE "user" SET role = 'admin', email_verified = true
       WHERE email = $1 AND role IS DISTINCT FROM 'admin'`,
      [adminEmail],
    );
    console.log(`[migrate] bootstrap admin ${adminEmail}: ${res.rowCount} row(s) updated`);
  } catch (e) {
    console.error("[migrate] bootstrap admin failed (non-fatal):", e.message);
  }
}

await pool.end();
