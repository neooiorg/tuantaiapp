import { processLeadgenPayload, verifySignature } from "@/server/lead/facebook";

export const runtime = "nodejs";

// Meta webhook verification handshake.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.FB_VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

// Leadgen events. Respond 200 fast; fetch/import errors are logged, never thrown.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    await processLeadgenPayload(payload);
  } catch (err) {
    console.error("[fb-webhook] processing error", err);
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
