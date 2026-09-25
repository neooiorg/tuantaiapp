// Seed dummy leads (+ some quotes/deposits) for demo/testing.
// Idempotent: all seeded leads use an "@seed.local" email and are deleted first.
// Run: node scripts/seed-leads.mjs   (reads DATABASE_URL from .env)
import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[seed] DATABASE_URL is not set");
  process.exit(1);
}

const needsSsl =
  connectionString.includes("sslmode=require") || connectionString.includes("neon.tech");
const pool = new pg.Pool({
  connectionString,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

const STATUSES = [
  "NEW",
  "CLAIMED",
  "CONSULTING",
  "QUOTED",
  "DEPOSITED",
  "AWAITING_SURVEY",
  "SURVEYED",
  "DESIGNING",
  "AWAITING_APPROVAL",
  "COMPLETED",
];

const NAMES = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Thị Dung",
  "Hoàng Minh Đức", "Vũ Thị Hà", "Đặng Văn Hải", "Bùi Thị Lan",
  "Đỗ Quang Huy", "Ngô Thị Mai", "Dương Văn Nam", "Lý Thị Oanh",
  "Phan Văn Phúc", "Trịnh Thị Quyên", "Cao Văn Sơn", "Mai Thị Trang",
];

const NOTES = [
  "Cần tư vấn tủ bếp gỗ óc chó",
  "Khách hỏi thi công phòng khách chung cư",
  "Yêu cầu báo giá nội thất trọn gói căn 2PN",
  "Quan tâm giường + tủ áo gỗ công nghiệp",
  "Khách cũ giới thiệu, làm lại phòng ngủ",
  "Cần khảo sát đo đạc showroom",
  null,
];

const ITEMS = [
  ["Tủ bếp gỗ An Cường", 1, 25_000_000],
  ["Bàn đảo bếp", 1, 8_500_000],
  ["Giường ngủ gỗ sồi 1m8", 1, 12_000_000],
  ["Tủ quần áo 4 cánh", 1, 15_500_000],
  ["Sofa da phòng khách", 1, 22_000_000],
  ["Kệ tivi gỗ công nghiệp", 1, 6_500_000],
  ["Bàn trà mặt đá", 1, 4_200_000],
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const client = await pool.connect();
  try {
    // Recipients for assignment: sales + admin users.
    const { rows: users } = await client.query(
      `SELECT id, name, role FROM "user" WHERE role IN ('sales', 'admin') ORDER BY role`,
    );
    if (users.length === 0) {
      console.error("[seed] No sales/admin users found — create a member first.");
      process.exit(1);
    }
    console.log(`[seed] assigning to ${users.length} user(s): ${users.map((u) => u.name).join(", ")}`);

    // Idempotency: remove previously seeded leads (cascade removes quotes/deposits/history).
    const del = await client.query(`DELETE FROM lead WHERE email LIKE '%@seed.local'`);
    console.log(`[seed] removed ${del.rowCount} previously seeded lead(s)`);

    const COUNT = 16;
    let quotesMade = 0;
    let depositsMade = 0;

    for (let i = 0; i < COUNT; i++) {
      const name = NAMES[i % NAMES.length];
      const status = rand(STATUSES);
      const assignee = rand(users);
      const phone = `09${randInt(10_000_000, 99_999_999)}`;
      const email = `lead${i + 1}@seed.local`;
      // Spread createdAt across the last 14 days so the trend chart has data.
      const daysAgo = randInt(0, 13);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(randInt(8, 18), randInt(0, 59), 0, 0);

      // NEW leads are unassigned (in the inbox model); the rest belong to a sales/admin.
      const assignedId = status === "NEW" ? null : assignee.id;

      const { rows } = await client.query(
        `INSERT INTO lead (name, phone, email, note, source, status, assigned_sales_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'manual', $5, $6, $7, $7)
         RETURNING id`,
        [name, phone, email, rand(NOTES), status, assignedId, createdAt],
      );
      const leadId = rows[0].id;

      // Statuses at/after QUOTED get a quote; at/after DEPOSITED also get a deposit.
      const idx = STATUSES.indexOf(status);
      if (idx >= STATUSES.indexOf("QUOTED")) {
        const lineCount = randInt(1, 3);
        const chosen = [];
        for (let k = 0; k < lineCount; k++) chosen.push(rand(ITEMS));
        const total = chosen.reduce((s, [, qty, price]) => s + qty * price, 0);

        const q = await client.query(
          `INSERT INTO quote (lead_id, total, note, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'sent', $4, $4) RETURNING id`,
          [leadId, total.toFixed(2), "Báo giá demo", createdAt],
        );
        const quoteId = q.rows[0].id;
        for (const [iname, qty, price] of chosen) {
          await client.query(
            `INSERT INTO quote_item (quote_id, name, quantity, unit_price, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [quoteId, iname, qty.toFixed(2), price.toFixed(2), createdAt],
          );
        }
        quotesMade++;

        if (idx >= STATUSES.indexOf("DEPOSITED")) {
          const amount = Math.round(total * 0.3);
          await client.query(
            `INSERT INTO deposit (lead_id, amount, paid_at, method, note, created_at)
             VALUES ($1, $2, $3, $4, $5, $3)`,
            [leadId, amount.toFixed(2), createdAt, "Chuyển khoản", "Cọc 30% (demo)"],
          );
          depositsMade++;
        }
      }
    }

    console.log(`[seed] inserted ${COUNT} leads, ${quotesMade} quotes, ${depositsMade} deposits`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("[seed] failed:", e);
  process.exit(1);
});
