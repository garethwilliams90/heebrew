import { seededOrder } from "@/lib/learn/pathway/order";
import type { PictureDirection, PictureWordItem } from "@/lib/learn/pathway/types";
import { wordById } from "@/lib/learn/words/catalog";

const directions: readonly PictureDirection[] = ["picture-hebrew", "english-hebrew", "hebrew-english"];

// One question in each direction, using words this level already teaches.
export function pictureWordItems(ids: readonly string[], pool: readonly string[], seed: string): PictureWordItem[] {
  const unique = [...new Set(ids)].filter((id) => wordById(id));
  const bank = [...new Set([...unique, ...pool])].filter((id) => wordById(id));
  if (unique.length === 0 || bank.length < 4) return [];

  return seededOrder(unique, seed)
    .slice(0, directions.length)
    .flatMap((answerId, index) => {
      const direction = directions[index];
      if (!direction) return [];
      const distractors = seededOrder(
        bank.filter((id) => id !== answerId),
        `${seed}-${answerId}`,
      ).slice(0, 3);
      if (distractors.length < 3) return [];
      return [
        {
          id: `${seed}-${direction}-${answerId}`,
          direction,
          answerId,
          choiceIds: seededOrder([answerId, ...distractors], `${seed}-${answerId}-set`),
        },
      ];
    });
}
