"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function OwnerEditor({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="outline" size="sm" className="self-start" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        {label}
      </Button>
      {open ? children : null}
    </div>
  );
}
