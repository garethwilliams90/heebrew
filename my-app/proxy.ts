import { createServerClient, type CookieOptions } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Ko-fi is configured to post donations to the site root. Forward that form
  // post to the webhook and leave Next.js server actions on the home page alone.
  if (isKofiWebhookPost(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/kofi/webhook";
    return NextResponse.rewrite(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return handleI18nRouting(request);
  }

  const pendingCookies: {
    name: string;
    value: string;
    options: CookieOptions;
  }[] = [];
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet);
        cacheHeaders = headers;
      },
    },
  });

  // Refresh the session before locale routing builds the response.
  await supabase.auth.getClaims();

  const response = handleI18nRouting(request);

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  for (const [header, value] of Object.entries(cacheHeaders)) {
    response.headers.set(header, value);
  }

  return response;
}

function isKofiWebhookPost(request: NextRequest) {
  if (request.method !== "POST" || request.nextUrl.pathname !== "/") {
    return false;
  }
  if (request.headers.has("next-action")) {
    return false;
  }
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/x-www-form-urlencoded");
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|instruments|auth|.*\\..*).*)",
};
