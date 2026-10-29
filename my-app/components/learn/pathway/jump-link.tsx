"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function JumpLink({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="outline" className="h-auto w-full whitespace-normal! sm:w-fit">
      <Link href={href}>
        {label}
        <ArrowRight data-icon="inline-end" />
      </Link>
    </Button>
  );
}
