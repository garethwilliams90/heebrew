import { getLocale, getTranslations } from "next-intl/server";
import { KofiSupport } from "@/components/support/kofi-support";
import { Fold } from "@/components/stories/fold";
import { StoryCard } from "@/components/stories/story-card";
import { StoryEditor } from "@/components/content/lazy-owner-tools";
import { Link } from "@/i18n/navigation";
import { storyGloss, storyLevels, type StoryDetail, type StoryLevel } from "@/lib/stories/queries";
import { cn } from "cn";

const panel = "rounded-3xl border border-emerald-950/10 bg-white/90 p-5 text-emerald-950 shadow-[0_24px_60px_-32px_rgba(6,78,59,0.45)]";

export async function StoriesView({
  level,
  owner,
  signedIn,
  stories,
}: {
  level: StoryLevel | null;
  owner: boolean;
  signedIn: boolean;
  stories: StoryDetail[];
}) {
  const t = await getTranslations("Stories");
  const locale = await getLocale();
  const filters: { href: "/stories" | `/stories?level=${StoryLevel}`; value: StoryLevel | null; label: string }[] = [
    { href: "/stories", value: null, label: t("all") },
    ...storyLevels.map((item) => ({
      href: `/stories?level=${item}` as const,
      value: item,
      label: t(item),
    })),
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-emerald-900/80">{t("description")}</p>
        </div>
        <KofiSupport variant="label" />
      </header>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const current = filter.value === level;
          return (
            <Link
              key={filter.label}
              href={filter.href}
              className={cn(
                "rounded-full px-3 py-1 text-sm",
                current ? "bg-emerald-800 text-white" : "bg-white/80 text-emerald-900",
              )}
              aria-current={current ? "page" : undefined}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      {owner ? (
        <Fold title={t("ownerTitle")} className={panel} titleClassName="text-lg font-semibold">
          <p className="mt-1 mb-4 text-sm text-emerald-900/70">{t("ownerHint")}</p>
          <StoryEditor />
        </Fold>
      ) : null}
      {stories.length === 0 ? <p className="text-sm text-emerald-900/70">{t("empty")}</p> : null}
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} owner={owner} signedIn={signedIn} gloss={storyGloss(story, locale)} />
      ))}
    </main>
  );
}
