import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

export function revalidateLocalized(path: "/stories" | "/blog" | "/learn" | "/dictionary" | `/blog/${string}`) {
  revalidatePath(path);
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${path}`);
  }
}
