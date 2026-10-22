/**
 * JSON success responses that match the current API contract: the payload
 * is returned as-is, not wrapped in `{ success, data }`.
 */

export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function jsonCreated<T>(data: T): Response {
  return Response.json(data, { status: 201 });
}
