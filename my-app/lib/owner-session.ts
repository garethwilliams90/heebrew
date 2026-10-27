import { isOwnerUser } from "@/lib/owner";
import { createClient } from "@/lib/supabase/server";

/** The signed-in owner, or null. Uses getUser so the session is checked with Supabase. */
export async function requireOwner() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isOwnerUser(data.user, process.env.APP_OWNER_EMAIL)) {
    return null;
  }
  return data.user;
}
