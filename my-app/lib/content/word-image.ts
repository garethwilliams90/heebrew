import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

// Word pictures live in the public Supabase storage bucket. Next/Image resizes
// those. Anything else stays a normal img so an unexpected host cannot 400.
export const wordImageRemotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
    port: "",
    pathname: "/storage/v1/object/public/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "54321",
    pathname: "/storage/v1/object/public/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "54321",
    pathname: "/storage/v1/object/public/**",
  },
];

export function isOptimizedWordImage(src: string) {
  try {
    const url = new URL(src);
    if (!url.pathname.startsWith("/storage/v1/object/public/")) {
      return false;
    }
    if (url.protocol === "https:" && (url.hostname === "supabase.co" || url.hostname.endsWith(".supabase.co"))) {
      return url.port === "";
    }
    const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
    return url.protocol === "http:" && local && url.port === "54321";
  } catch {
    return false;
  }
}
