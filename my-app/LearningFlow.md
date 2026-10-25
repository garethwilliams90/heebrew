# Learning flow

This file is the source of truth for what Webrew teaches. It records the pathway a learner sees on the home page: the sections, the levels inside them, the exercises each level runs, and the words those levels use.

[AGENTS.md](AGENTS.md) stays the source of truth for the tech stack, interface language and direction, how flashcards, training, streaks, and auth behave, and the working agreements.

The pathway is the home page. After login the learner sees sections and levels, not a separate start menu. A level stays locked until the previous level in that section is complete. The first level of a section stays locked until the previous section's exam is passed. Section 1 is open from the start.

Flashcards and the aleph-bet reference unlock when Section 2 unlocks. Training stays locked until Section 5. Experience still records practice. It does not open levels. Words a learner covers in a level are saved to the Known words deck.

## How a level is built

Every level introduces one concept. It opens with one intro slide, or two when the concept needs a second idea. The slides show the Hebrew, play it, and give the translation in the interface language.

The level then runs an ordered list of exercises. A section can use the same list for every level. A level can override that list. An exercise marked optional can be skipped.

Hebrew in a level is `dir="rtl"` and `lang="he"`. Interface copy stays in `messages/en.json`, `messages/fr.json`, and `messages/es.json`. The Hebrew and its English, French, and Spanish glosses live in the section content files.

Adding a level means appending one object to that section's content file. The runner already knows every exercise id below.

## Exercises

1. **nikud-drop.** A letter sound is played. The letter is shown without its nikud. Three nikud choices, each a different vowel sound, can be dragged onto the letter.
2. **recognize-sound.** A letter or word is played and not shown. Three written choices appear. One matches the sound.
3. **compose-gap.** The full sentence is played and not shown as a finished line. The learner sees a partly filled sentence and drags words from a bank into the gaps. This is variant 3a.
4. **conjugate.** A sensible sentence is missing one verb. Four conjugations of that verb are shown. Only one fits. This is variant 3b. No current level schedules it.
5. **listen-repeat.** A word or sentence is played. The learner says it back. Speech recognition passes an exact match. One wrong word, or a word off by a letter or two, still passes, and the learner is told the pronunciation was slightly off. In Sections 1 and 2 this exercise is optional.
6. **read.** A Hebrew sentence is shown. The learner types the translation in the interface language.
7. **write.** A sentence is shown in the interface language. The learner types the Hebrew. No current level schedules it.
8. **comprehend.** A sentence is shown with a question about it. No current level schedules it.
9. **spell.** The word is played. The learner taps letters from a bank in order.

## Exams, skips, and the daily review

The section exam is also the skip. Passing it opens the first level of the next section, even when earlier levels in the previous section were not finished. A locked section offers that exam from its header.

Section 1's exam is 20 questions and 3 lives. The questions mix nikud-drop, recognize-sound, and listen-repeat across every letter, including the final forms. A wrong answer costs one life. At zero lives the attempt fails and can be retaken.

Later section exams use the same shape: 20 questions, 3 lives, drawn from the exercises that section teaches.

If the last study was more than 24 hours ago, the home page prompts an 8-question review of the most recently studied section. The review uses that section's exercise types and has no lives. Finishing it counts as study. Dismissing it leaves the clock unchanged, so the prompt returns on the next visit.

## Word catalog

Lesson words, their audio, and their metadata come from [lib/learn/words/catalog.json](lib/learn/words/catalog.json). That file is the list the app reads. It was filtered out of `public/hebrew_duolingo_app_bundle/vocabulary.json`, and the recordings stay in `public/hebrew_duolingo_app_bundle/audio`.

Each entry has `id`, `hebrew`, `niqqud`, `transliteration`, `en`, `fr`, `es`, `gender`, `partOfSpeech`, and `audio`. `audio` is a path under the bundle, or `null` when the bundle has no clip. A missing clip is spoken with Azure.

To add a word that already exists in the bundle, run this from `my-app`:

```bash
node scripts/pull-words.mjs אבא שלום
```

The script copies Hebrew, niqqud, the English gloss, gender, part of speech, and the audio path. French and Spanish already on an entry are left as they are. A new entry copies the English gloss into French and Spanish until those lines are edited. Words that are not in the bundle can be typed into the catalog by hand with `"audio": null`.

## Section 1 — Welcome to Hebrew, the Aleph-Bet

Every level in this section uses nikud-drop, recognize-sound, and optional listen-repeat.

ו through ת is 17 letters, so two letters a level cannot fill a run numbered 2 through 11. ת has the last letter level on its own. There is no level between ת and the final forms.

- **Level 0.** א ב ג. Aleph, bet, and gimel.
- **Level 1.** ד ה. Dalet and he.
- **Level 2.** ו ז. Vav and zayin.
- **Level 3.** ח ט. Chet and tet.
- **Level 4.** י כ. Yod and kaf.
- **Level 5.** ל מ. Lamed and mem.
- **Level 6.** נ ס. Nun and samekh.
- **Level 7.** ע פ. Ayin and pe.
- **Level 8.** צ ק. Tsadi and kuf.
- **Level 9.** ר ש. Reish and shin.
- **Level 10.** ת. Tav.
- **Level 11.** Final forms ך ץ ן ם ף. Kaf, tsadi, nun, mem, and pe at the end of a word.

The exam then opens Section 2.

## Section 2 — Hebrew 101, fundamentals

More levels will be added here when they are specified. Level 0 uses words from the catalog that can be spelled with א through ה.

### Level 0 — Forming two-letter words

Words: אַב father, בָּא comes, גַּג roof, דָּג fish, בַּד cloth.

Exercises: nikud-drop, recognize-sound, listen-repeat (optional).

### Level 1 — Pronouns

Words: אֲנִי I, אַתָּה you (masculine), אֲנַחְנוּ we, אַתֶּם you (masculine plural), אַתֶּן you (feminine plural), הוּא he, הִיא she.

Exercises: recognize-sound, listen-repeat (optional), spell.

### Level 2 — Introduce yourself

Phrases, with דָּן standing in for the learner's name:

- שָׁלוֹם hello
- אֲנִי דָּן I am Dan
- אֲנִי מֵאַנְגְּלִיָּה I am from England
- קוֹרְאִים לִי דָּן my name is Dan
- אֵיפֹה אַתָּה גָּר where do you live (masculine)
- אֵיפֹה אַתְּ גָּרָה where do you live (feminine)
- מֵאֵיפֹה אַתָּה where are you from (masculine)
- מֵאֵיפֹה אַתְּ where are you from (feminine)

Exercises: recognize-sound, listen-repeat (optional), spell, compose-gap.

### Level 3 — How are you

Phrases:

- מַה שְּׁלוֹמְךָ how are you (masculine)
- מַה שְּׁלוֹמֵךְ how are you (feminine)
- אֵיךְ אַתָּה how are you (masculine)
- אֵיךְ אַתְּ how are you (feminine)

Exercises: recognize-sound, listen-repeat (optional), spell, compose-gap.

### Level 4 — I like

Two intro slides.

The first teaches that לֶאֱהֹב is the infinitive, "to love" or "to like", and lists the present tense:

- אֲנִי אוֹהֵב / אֲנִי אוֹהֶבֶת
- אַתָּה אוֹהֵב
- אַתְּ אוֹהֶבֶת
- הוּא אוֹהֵב
- הִיא אוֹהֶבֶת
- אֲנַחְנוּ אוֹהֲבִים / אֲנַחְנוּ אוֹהֲבוֹת
- אַתֶּם אוֹהֲבִים
- אַתֶּן אוֹהֲבוֹת
- הֵם אוֹהֲבִים
- הֵן אוֹהֲבוֹת

The second teaches את ה. An indefinite object takes no את: אֲנִי אוֹהֵב גְּלִידָה, "I like ice cream". A definite object takes את plus ה: הִיא אוֹהֶבֶת אֵת הַדָּג, "she likes the fish".

Exercises: recognize-sound, listen-repeat (optional), spell, compose-gap, read.

## Later sections

Sections after Section 2 are not specified yet. They will be added to this file first, then as another content module in the same shape.
