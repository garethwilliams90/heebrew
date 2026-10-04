"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleAuthButton({
  disabled,
  onError,
}: {
  disabled?: boolean;
  onError: (message: string | null) => void;
}) {
  const t = useTranslations("Auth");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogle() {
    onError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=/`,
      },
    });

    if (error) {
      onError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={disabled || isLoading}
      onClick={handleGoogle}
    >
      {isLoading ? t("continuingWithGoogle") : t("continueWithGoogle")}
    </Button>
  );
}
