"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function formFallback() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

export const StoryEditor = dynamic(() => import("@/components/stories/story-editor").then((mod) => mod.StoryEditor), {
  loading: formFallback,
});

export const PostEditor = dynamic(() => import("@/components/blog/post-editor").then((mod) => mod.PostEditor), {
  loading: formFallback,
});

export const MediaUploader = dynamic(
  () => import("@/components/content/media-uploader").then((mod) => mod.MediaUploader),
  { loading: formFallback },
);
