import { gematria } from "@/lib/learn/gematria";
import { pathwaySections } from "@/lib/learn/pathway/catalog";
import { pathwayShape } from "@/lib/learn/pathway/shape";
import type { Gloss, IntroSlide } from "@/lib/learn/pathway/types";

export type PathwayLessonSlide = {
  title: Gloss;
  body: Gloss;
  samples: string[];
};

export type PathwayLessonChoice = {
  id: string;
  sectionId: string;
  index: number;
  badge: string;
  title: Gloss;
  about: Gloss;
  slides: PathwayLessonSlide[];
};

export type PathwayLessonSection = {
  id: string;
  title: Gloss;
  levels: PathwayLessonChoice[];
};

export type PathwayLevelRef = {
  id: string;
  sectionId: string;
  href: `/learn?section=${string}&level=${string}`;
  badge: string;
  title: Gloss;
};

const levelIds = new Set(pathwayShape.flatMap((section) => section.levels.map((level) => level.id)));

export function isPathwayLevelId(id: string) {
  return levelIds.has(id);
}

function slidesOf(intros: readonly IntroSlide[]): PathwayLessonSlide[] {
  const seen = new Set<string>();
  const slides: PathwayLessonSlide[] = [];
  for (const slide of intros) {
    const key = `${slide.title.en}\n${slide.body.en}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    slides.push({
      title: slide.title,
      body: slide.body,
      samples: (slide.samples ?? []).map((sample) => sample.hebrew).filter(Boolean).slice(0, 6),
    });
  }
  return slides;
}

/** Titles, descriptions, and intro text for the owner's level picker. */
export function pathwayLessonCatalog(): PathwayLessonSection[] {
  return pathwaySections.map((section) => ({
    id: section.id,
    title: section.title,
    levels: section.levels.map((level) => ({
      id: level.id,
      sectionId: section.id,
      index: level.index,
      badge: level.badge ?? gematria(level.index + 1),
      title: level.title,
      about: level.about,
      slides: slidesOf(level.intros),
    })),
  }));
}

export function pathwayLevelRef(id: string): PathwayLevelRef | null {
  for (const section of pathwaySections) {
    const level = section.levels.find((item) => item.id === id);
    if (!level) {
      continue;
    }
    return {
      id: level.id,
      sectionId: section.id,
      href: `/learn?section=${section.id}&level=${level.id}`,
      badge: level.badge ?? gematria(level.index + 1),
      title: level.title,
    };
  }
  return null;
}
