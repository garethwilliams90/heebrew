import { ApiError } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;
type AuthUser = NonNullable<
  Awaited<ReturnType<ServerClient["auth"]["getUser"]>>["data"]["user"]
>;

export type AuthenticatedContext = {
  user: AuthUser;
  supabase: ServerClient;
};

/**
 * Require a signed-in user, then run the handler with that session.
 * Pass the existing route message; Anki uses `signed-out`, cards use
 * `Sign in required`.
 */
export function withAuth(
  handler: (request: Request, context: AuthenticatedContext) => Promise<Response> | Response,
  unauthorized = "Sign in required",
) {
  return async (request: Request) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return ApiError.unauthorized(unauthorized);
    }

    return handler(request, { user: data.user, supabase });
  };
}
