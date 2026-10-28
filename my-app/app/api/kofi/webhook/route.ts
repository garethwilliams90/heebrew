import { timingSafeEqual } from "node:crypto";
import { donationFromPayload } from "@/lib/kofi/payload";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const payload = await readPayload(request);
  const donation = donationFromPayload(payload);
  if (!donation) {
    return new Response("Bad request", { status: 400 });
  }

  const expected = process.env.KOFI_VERIFICATION_TOKEN;
  if (!expected) {
    return new Response("Ko-fi is not configured", { status: 503 });
  }
  if (!tokensMatch(donation.token, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const service = createServiceClient();
    const { error } = await service.from("kofi_donations").upsert(
      {
        message_id: donation.messageId,
        transaction_id: donation.transactionId,
        event_type: donation.type,
        from_name: donation.fromName,
        message: donation.message,
        amount: donation.amount,
        currency: donation.currency,
        is_public: donation.isPublic,
        donated_at: donation.donatedAt,
      },
      { onConflict: "message_id", ignoreDuplicates: true },
    );

    if (error) {
      return new Response("Could not save donation", { status: 500 });
    }
  } catch {
    return new Response("Could not save donation", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await request.json();
    }

    const form = await request.formData();
    const data = form.get("data");
    if (typeof data !== "string") {
      return null;
    }
    return JSON.parse(data) as unknown;
  } catch {
    return null;
  }
}

function tokensMatch(given: string, expected: string) {
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
