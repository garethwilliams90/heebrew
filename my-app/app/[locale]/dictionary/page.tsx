import { DictionaryPage } from "@/components/dictionary/dictionary-page";
import { loadStoryDictionary } from "@/lib/learn/story-dictionary";

export default async function Dictionary() {
  const storyWords = await loadStoryDictionary();
  return <DictionaryPage extra={storyWords} />;
}
