export type KofiDonation = {
  token: string;
  messageId: string;
  transactionId: string | null;
  type: string;
  fromName: string | null;
  message: string | null;
  amount: number;
  currency: string;
  isPublic: boolean;
  donatedAt: string;
};

/** Ko-fi posts a JSON object. Private names and messages are dropped before storage. */
export function donationFromPayload(value: unknown): KofiDonation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const token = text(row.verification_token, 200);
  const messageId = text(row.message_id, 80);
  const type = text(row.type, 40);
  const amountText = text(row.amount, 16);
  const currency = text(row.currency, 3)?.toUpperCase();
  if (!token || !messageId || !type || !amountText || !currency || !/^[A-Z]{3}$/.test(currency)) {
    return null;
  }

  const amount = Number(amountText);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
    return null;
  }

  const isPublic = row.is_public === true;
  const donatedAt = time(row.timestamp);

  return {
    token,
    messageId,
    transactionId: text(row.kofi_transaction_id, 80),
    type,
    fromName: isPublic ? text(row.from_name, 80) : null,
    message: isPublic ? text(row.message, 500) : null,
    amount,
    currency,
    isPublic,
    donatedAt,
  };
}

function text(value: unknown, limit: number) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, limit);
}

function time(value: unknown) {
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}
