import assert from "node:assert/strict";
import test from "node:test";
import { donationFromPayload } from "./payload";

test("a public Ko-fi donation keeps the name and message", () => {
  const donation = donationFromPayload({
    verification_token: "token",
    message_id: "msg-1",
    timestamp: "2026-10-28T12:00:00Z",
    type: "Donation",
    is_public: true,
    from_name: "Ada",
    message: "Shalom",
    amount: "3.00",
    currency: "usd",
    kofi_transaction_id: "txn-1",
  });

  assert.equal(donation?.fromName, "Ada");
  assert.equal(donation?.message, "Shalom");
  assert.equal(donation?.amount, 3);
  assert.equal(donation?.currency, "USD");
  assert.equal(donation?.isPublic, true);
});

test("a private Ko-fi donation drops the name and message", () => {
  const donation = donationFromPayload({
    verification_token: "token",
    message_id: "msg-2",
    type: "Donation",
    is_public: false,
    from_name: "Ada",
    message: "Secret",
    amount: "5",
    currency: "EUR",
  });

  assert.equal(donation?.fromName, null);
  assert.equal(donation?.message, null);
  assert.equal(donation?.isPublic, false);
});

test("a donation without a verification token is rejected", () => {
  assert.equal(donationFromPayload({ message_id: "msg", type: "Donation", amount: "1", currency: "USD" }), null);
});
