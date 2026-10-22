import {
  badGateway,
  badRequest,
  jsonError,
  payloadTooLarge,
  unauthorized,
  unprocessable,
} from "./error";
import { jsonCreated, jsonOk } from "./success";

/**
 * Named helpers for route handlers. Same bodies and status codes as today.
 */
export const ApiError = {
  of: jsonError,
  unauthorized,
  badRequest,
  payloadTooLarge,
  unprocessable,
  badGateway,
};

export const ApiResponse = {
  json: jsonOk,
  created: jsonCreated,
};
