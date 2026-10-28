"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { removeMedia } from "@/lib/content/media-actions";
import type { MediaView } from "@/lib/content/media-queries";

export function MediaGallery({ items, owner }: { items: MediaView[]; owner: boolean }) {
  const t = useTranslations("Media");
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {items.map((item) => (
        <figure key={item.id}>
          {item.kind === "video" ? (
            <video className="max-h-[28rem] w-full rounded-2xl bg-black" controls playsInline preload="metadata" src={item.url}>
              {item.alt}
            </video>
          ) : (
            // Signed URLs expire, so the image optimizer cannot cache them.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="max-h-[28rem] w-full rounded-2xl object-contain"
              src={item.url}
              alt={item.alt}
              decoding="async"
              fetchPriority={item === items[0] ? "high" : "auto"}
              loading={item === items[0] ? "eager" : "lazy"}
            />
          )}
          {item.alt ? <figcaption className="mt-1 text-sm text-emerald-900/70">{item.alt}</figcaption> : null}
          {owner ? (
            <form action={removeMedia} className="mt-2">
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" variant="outline" size="sm">
                {t("remove")}
              </Button>
            </form>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
