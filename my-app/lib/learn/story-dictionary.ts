import type { DictionaryEntry } from "@/lib/learn/dictionary";
import { isPartOfSpeech, type GrammaticalGender } from "@/lib/flashcards/types";
import { createClient } from "@/lib/supabase/server";

function genderOf(value: string | null): GrammaticalGender | null {
  return value === "masculine" || value === "feminine" ? value : null;
}

/** Story words saved into the shared vocabulary, for the dictionary. */
export async function loadStoryDictionary(): Promise<DictionaryEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vocabulary_words")
      .select("id, hebrew, en, fr, es, transliteration, part_of_speech, gender")
      .contains("tags", ["story"]);
    if (error || !data || data.length === 0) {
      return [];
    }
    const examples = await supabase
      .from("word_examples")
      .select("word_id, hebrew, en")
      .in("word_id", data.map((word) => word.id));
    const exampleByWord = new Map((examples.data ?? []).map((example) => [example.word_id, example]));
    return data.flatMap((word) => {
      if (!isPartOfSpeech(word.part_of_speech)) {
        return [];
      }
      const example = exampleByWord.get(word.id);
      return [
        {
          id: word.id,
          hebrew: word.hebrew,
          transliteration: word.transliteration ?? "",
          gloss: { en: word.en, fr: word.fr ?? word.en, es: word.es ?? word.en },
          audio: null,
          partOfSpeech: word.part_of_speech,
          gender: genderOf(word.gender),
          exampleHebrew: example?.hebrew,
          exampleGloss: example?.en,
        },
      ];
    });
  } catch {
    return [];
  }
}
