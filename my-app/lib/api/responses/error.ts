/**
 * JSON error responses that match the current API contract: `{ error: string }`.
 * Pass the existing route message when migrating so clients see no change.
 */

export type ApiErrorBody = {
  error: string;
};

export function jsonError(error: string, status: number): Response {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}

export function unauthorized(error: string): Response {
  return jsonError(error, 401);
}

export function badRequest(error: string): Response {
  return jsonError(error, 400);
}

export function payloadTooLarge(error: string): Response {
  return jsonError(error, 413);
}

export function unprocessable(error: string): Response {
  return jsonError(error, 422);
}

export function badGateway(error: string): Response {
  return jsonError(error, 502);
}
