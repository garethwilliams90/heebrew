"use client";

import { useLocale, useTranslations } from "next-intl";
import { printFont } from "@/components/alephbet/print-font";
import { DevSectionSkip } from "@/components/learn/dev-level";
import { StonePath } from "@/components/learn/nature-scene";
import { PathLamp } from "@/components/learn/pathway/path-lamp";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import type { PathwaySectionOutline } from "@/lib/learn/pathway/types";
import { gematria } from "@/lib/learn/gematria";
import { glossOf } from "@/lib/learn/sentences";
import { cn } from "cn";

const shifts = [4, 36, 12, 42, 18, 30];

export function PathwaySectionView({
  section,
  open,
  previousExamHref,
  levelOpen,
  startIndex,
}: {
  section: PathwaySectionOutline;
  open: boolean;
  previousExamHref?: string;
  levelOpen: (levelId: string) => boolean;
  startIndex: number;
}) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const title = `${glossOf(section.title, locale)} — ${glossOf(section.about, locale)}`;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full max-w-md items-center gap-3" dir="ltr">
        <span className="h-px flex-1 bg-emerald-900/20" />
        <div className="max-w-xs text-center">
          <p className="text-sm font-semibold tracking-wide text-emerald-800 uppercase">{title}</p>
          <DevSectionSkip sectionId={section.id} />
          {open || !previousExamHref ? null : (
            <Link href={previousExamHref} className="mt-1 inline-block text-sm font-medium text-emerald-900 underline-offset-4 hover:underline">
              {t("skipSection")}
            </Link>
          )}
        </div>
        <span className="h-px flex-1 bg-emerald-900/20" />
      </div>
      {section.levels.map((level, index) => {
        const unlocked = open && levelOpen(level.id);
        const href = `/learn?section=${section.id}&level=${level.id}`;
        const place = startIndex + index;
        const lean = Math.round(((shifts[place % shifts.length] ?? 0) - 23) * 0.6);
        const showStones = index < section.levels.length - 1 || (open && section.hasExam);
        const number = level.badge ?? gematria(level.index + 1);
        return (
          <div key={level.id} className="flex w-full justify-center overflow-x-clip">
            <div className="flex flex-col items-center" style={{ translate: `clamp(-5.5rem, ${lean}vw, 5.5rem) 0` }}>
            <LevelNode
              mark={number}
              label={t("lessonName", { level: number, title: glossOf(level.title, locale) })}
              about={glossOf(level.about, locale)}
              href={unlocked ? href : undefined}
            />
            {showStones ? (
              <div className="relative">
                <StonePath turn={(place % 5) * 8 - 12} />
                <PathLamp
                  side={lean >= 0 ? "left" : "right"}
                  kind={place % 2 === 0 ? "lantern" : "torch"}
                  delay={(place % 6) * 0.45}
                />
              </div>
            ) : null}
            </div>
          </div>
        );
      })}
      {open && section.hasExam ? (
        <div className="relative">
          <LevelNode
            mark={t("examName")}
            label={t("examName")}
            about={t("examAbout")}
            href={`/learn?section=${section.id}&exam=1`}
            exam
          />
          <PathLamp side="right" kind="lantern" delay={0.2} />
        </div>
      ) : null}
    </div>
  );
}

function LevelNode({
  mark,
  label,
  about,
  href,
  exam = false,
}: {
  mark: string;
  label: string;
  about: string;
  href?: string;
  exam?: boolean;
}) {
  const className = cn(
    "flex aspect-square max-w-full flex-col items-center justify-center border leading-none",
    exam
      ? "w-[clamp(6.75rem,34vw,9.25rem)] rounded-full border-emerald-400 bg-emerald-100 px-6 py-5 text-center font-sans text-[clamp(1rem,3.6vw,1.25rem)] font-semibold text-emerald-950 shadow-[0_0_0_10px_rgba(16,185,129,0.22),0_0_42px_12px_rgba(16,185,129,0.55)] ring-2 ring-emerald-300"
      : cn(
          printFont.className,
          "w-[clamp(4.25rem,22vw,7rem)] rounded-2xl px-2 text-[clamp(1.45rem,6vw,2.35rem)]",
          href
            ? "border-emerald-950/30 bg-emerald-50 text-black shadow-[0_16px_40px_-28px_rgba(6,78,59,0.8)]"
            : "cursor-not-allowed border-emerald-950/5 bg-white/40 text-emerald-950/30",
        ),
  );
  const body = href ? (
    <Link href={href} className={className} lang={exam ? undefined : "he"} dir={exam ? undefined : "rtl"} aria-label={label}>
      {mark}
    </Link>
  ) : (
    <span className={className} aria-disabled="true" lang={exam ? undefined : "he"} dir={exam ? undefined : "rtl"}>
      {mark}
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs flex-col items-start gap-1 bg-white px-3 py-2 text-left text-emerald-950 shadow-[0_16px_40px_-24px_rgba(6,78,59,0.8)]"
        arrowClassName="bg-white fill-white"
      >
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-emerald-900/75">{about}</p>
      </TooltipContent>
    </Tooltip>
  );
}
