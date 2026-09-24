import crypto from "node:crypto";
import { lead, leadStatusHistory } from "@/server/db/schema";
import { db } from "@/server/db";

const FB_GRAPH_VERSION = "v21.0";

type FieldDatum = { name: string; values: string[] };

interface LeadgenChangeValue {
  leadgen_id?: string;
  form_id?: string;
  ad_id?: string;
  page_id?: string;
  created_time?: number;
}

// Verify Meta's X-Hub-Signature-256 header against the raw request body.
export function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.FB_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Fetch the lead's field_data from the Graph API.
async function fetchLeadFieldData(leadgenId: string): Promise<FieldDatum[]> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("FB_PAGE_ACCESS_TOKEN is not set");

  const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${leadgenId}?fields=field_data&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Graph API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { field_data?: FieldDatum[] };
  return json.field_data ?? [];
}

function firstValue(fields: FieldDatum[], name: string): string | undefined {
  return fields.find((f) => f.name === name)?.values?.[0];
}

// Map Facebook field_data to Lead fields. Non-standard fields go into `note`.
function mapFieldData(fields: FieldDatum[]): {
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
} {
  const fullName =
    firstValue(fields, "full_name") ??
    [firstValue(fields, "first_name"), firstValue(fields, "last_name")].filter(Boolean).join(" ").trim();

  const phone = firstValue(fields, "phone_number") ?? "";
  const email = firstValue(fields, "email") ?? null;

  const standard = new Set(["full_name", "first_name", "last_name", "phone_number", "email"]);
  const extra = fields
    .filter((f) => !standard.has(f.name))
    .map((f) => `${f.name}: ${f.values.join(", ")}`)
    .join("\n");

  return {
    name: fullName || "Khách Facebook",
    phone,
    email,
    note: extra || null,
  };
}

// Idempotent upsert keyed by fb_leadgen_id. Returns the new lead, or null if it already existed.
export async function upsertFacebookLead(value: LeadgenChangeValue) {
  const leadgenId = value.leadgen_id;
  if (!leadgenId) return null;

  const fields = await fetchLeadFieldData(leadgenId);
  const mapped = mapFieldData(fields);

  const inserted = await db
    .insert(lead)
    .values({
      name: mapped.name,
      phone: mapped.phone,
      email: mapped.email,
      note: mapped.note,
      source: "facebook",
      fbLeadgenId: leadgenId,
      formId: value.form_id ?? null,
      adId: value.ad_id ?? null,
      status: "NEW",
    })
    .onConflictDoNothing({ target: lead.fbLeadgenId })
    .returning();

  const newLead = inserted[0];
  if (newLead) {
    await db.insert(leadStatusHistory).values({
      leadId: newLead.id,
      fromStatus: null,
      toStatus: "NEW",
      userId: null,
      note: "Tạo từ Facebook Lead Ads",
    });
  }

  return newLead ?? null;
}

// Walk the webhook payload and upsert every leadgen change. Each change is isolated
// so one failure doesn't block the others.
export async function processLeadgenPayload(payload: unknown): Promise<void> {
  const entries = (payload as { entry?: Array<{ changes?: Array<{ field?: string; value?: LeadgenChangeValue }> }> })
    ?.entry;
  if (!Array.isArray(entries)) return;

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen" || !change.value) continue;
      try {
        await upsertFacebookLead(change.value);
      } catch (err) {
        console.error("[fb-webhook] failed to import leadgen", change.value?.leadgen_id, err);
      }
    }
  }
}
