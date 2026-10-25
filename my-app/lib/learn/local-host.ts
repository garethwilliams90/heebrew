export function isLocalHost(host = typeof window === "undefined" ? "" : window.location.hostname) {
  return host === "localhost" || host === "127.0.0.1";
}
