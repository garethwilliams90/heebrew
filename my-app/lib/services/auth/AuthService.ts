import { BaseService } from "@/lib/services/core";
import { createClient } from "@/lib/supabase/client";

export type BrowserAuth = {
  supabase: ReturnType<typeof createClient>;
  userId: string;
};

/**
 * Browser-session auth. Creates a client per call so cookies stay current.
 * Not registered on ServiceContainer.
 */
export class AuthService extends BaseService {
  constructor() {
    super();
  }

  async requireBrowserUser(): Promise<BrowserAuth | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    return { supabase, userId: data.user.id };
  }
}

export function requireBrowserUser() {
  return new AuthService().requireBrowserUser();
}
