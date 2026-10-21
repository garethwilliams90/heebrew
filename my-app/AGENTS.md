<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Webrew

## Sources of truth

Refer to these two files, and only these, for how the project is defined:

- **AGENTS.md** — tech stack, interface language and direction, how current features behave, and working agreements.
- **LearningFlow.md** — the conceptual path of the app and it's flow through the levelling system

Webrew is an interactive, modern, fully responsive web app for Hebrew learners at every level, from total beginners to advanced speakers. It should feel easy and intuitive: a sleek UI, clean smooth animations, and a subtle nature theme that shows up in logos, icons, and sound effects.

The app lives in this Next.js project (`my-app`). The repo root README describes it as a Hebrew language learning platform for all levels.

The curriculum in LearningFlow.md does not rewrite Alephbet, flashcards, training, streaks, or auth. Those stay available as they are. Curriculum levels are a content gate, and content is fed gradually. Aleph bet unlocks at level 3. Flashcards unlock at level 5. Training unlocks at level 15.

## Tech stack

Use only this stack unless the owner explicitly requests or approves a deviation:

- Next.js, TypeScript, React
- Tailwind CSS
- shadcn/ui for components
- Supabase for authentication and the database
- https://mcp.kitbitz.art kitbitz for images for flashcards and general illustrations
- `use-sound` for sound effects
- `next-intl` for interface languages
- Azure AI Translator on the free F0 tier for English-to-Hebrew text, Azure AI Speech on the free F0 tier for speaking the Hebrew, and Dicta's free Nakdan for grammatical gender. Translator allows 2 million characters a month. Speech allows 0.5 million neural characters a month. Both stay free only while the Azure resources are on F0. Keys stay server-side in `.env.local` as `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`, `AZURE_SPEECH_KEY`, and `AZURE_SPEECH_REGION`. Do not expose them to the browser. Dicta Nakdan needs no key. Do not call the public Google Translate website.

## Language and direction

Interface languages are English, French, and Spanish, for learners in Europe. English is the default. The interface stays left-to-right for every interface language. Set `dir="ltr"` on the document and `lang` to the active locale (`en`, `fr`, or `es`).

Use `next-intl` for interface copy. Locales and routing live in `i18n/routing.ts`. Messages live in `messages/en.json`, `messages/fr.json`, and `messages/es.json`. The default locale is served at `/`. French and Spanish use `/fr` and `/es`. Use the navigation helpers in `i18n/navigation.ts` for internal links so the locale prefix is kept.

Hebrew study content (words, sentences, answers) is still right-to-left. Mark those strings with `dir="rtl"` and `lang="he"` on the element that contains them. Hebrew is not an interface language.

Keep the interface responsive on mobile and desktop.

## Features

Build these in roughly this order. Feature 5 is low priority.

### 1. Flashcards with spaced repetition

Study is a single large card on a calm screen, in the spirit of Reverso's flashcards: the word centered, a short part-of-speech label beside it, a speaker control, an example sentence, and a control to flip. Clicking the card or pressing Space flips it. A session shows progress across the cards that are due.

The interface around the card stays left-to-right. English on the front is left-to-right. Hebrew on the back is `dir="rtl"` and `lang="he"`.

**Front.** The English word and its part of speech (noun, verb, adjective, adverb, and so on). An example sentence can sit under the word.

**Back.** The Hebrew translation, a speaker control for the Hebrew, and the grammatical gender when the word has one. The masculine mark is blue and the feminine mark is pink.

**Creating cards.** A learner can create a card. They enter the English word and part of speech. Azure Translator fills in the Hebrew translation (`from=en`, `to=he`). Dicta Nakdan then reads that Hebrew with morphology turned on and supplies masculine or feminine when the word has a gender. The learner can edit the translation and the gender before saving. Translator returns the translated string only. One unpointed Hebrew spelling can have more than one reading, so the saved gender is the one the learner confirms. Part of speech stays on the card record.

**Audio.** Azure Speech speaks the Hebrew on the back, using the neural voice `he-IL-HilaNeural`. The front has no speaker. Pressing R on the back replays that audio, and the speaker shows an R mark. A voice's male or female setting is how the voice sounds. It is not the grammatical gender of the word.

A gear beside the card opens a row of icon toggles to the right: word sound, general sound, sentence sound, nikud, and the example sentence. Each toggle has a tooltip that names it. Showing or hiding nikud fades the vowel marks, and showing or hiding the example sentence opens and closes that line. The session bar marks the end of each card with a blue dot.

**Recall.** After the flip, the learner marks the card. Vocabulary cards use Anki's SM-2 scheduler: learning steps of 1 minute and 10 minutes, then a 1-day graduate interval. A remembered review multiplies the interval by the card's ease, starting at 2.5 and never below 1.3. Missing a review drops ease by 0.2 and sends the card through a 10-minute relearn. Ease does not change during the first learning steps. Reviewing a card late lengthens the next interval. The ring shows six stages read from that schedule, from empty (new) to a solid circle with a star (mastered, about 50 days or the mastered button). Hovering the ring explains those stages and credits Anki's spaced repetition. The deck's card list shows the same ring. A session is the cards that are due, up to 10, with new cards filling any remaining space. Letter practice stays a linear 0–6 ladder and does not use this scheduler.

- Don't know: the Again grade. Show the card again soon.
- Know: the Good grade. Move to the next step, or lengthen the review interval.
- Mastered: a separate control. Set the card to stage 6 and wait about 120 days.

### 2. Training centre

A practice area for Hebrew grammar and sentence structure, separate from vocabulary study. A round is five questions.

Each question shows one full Hebrew sentence with one or two blanks. The missing words are usually verbs: tense, person, gender, or binyan (בניין). They can also be other grammatical forms, such as possession (שֶׁלּוֹ, שֶׁלָּכֶם).

Under the sentence, three choices appear as cards. Exactly one choice is correct. Choosing a card shows whether it was right, and the correct card stays marked. The learner then continues to the next question.

A correct answer is worth 10 experience points. Points are added once, when the five-question round finishes, for every question answered correctly. Leaving before the round ends does not award points. The end of the round uses the same experience bar as a finished flashcard session.

### 3. Levels, experience, and a leaderboard

Users earn experience points for correct answers and completed training exercises. A basic levelling system tracks that progress. A leaderboard lists all users and their levels.

### 4. Streaks

A daily streak, in the spirit of Duolingo: practising a set amount in a day increases the streak. A high streak also contributes experience.

### 5. Gendered-word images (low priority)

For masculine and feminine words on flashcards, generate images with AI. Example: a masculine table, גבר / שולחן.

### 6. Authentication

Login, logout, and registration through Supabase. Email and password are at `/login` and `/sign-up`. Google uses the same screens and returns through `/auth/confirm`. Phone and GitHub come after those providers are configured in Supabase.

## Working agreements

- Prioritise readable, easily editable code. Use logical function names. Add a short comment where the purpose is not obvious from the name. Keep components small and reusable, and put each one in its own file whenever that split stays clear.
- Do not add libraries, services, or UI kits outside the stack above unless the owner asks for them or approves them first.
- Prefer the existing Next.js App Router project. Read `node_modules/next/dist/docs/` before using Next.js APIs that may have changed.
- Keep UI work consistent with the nature theme, smooth motion, and a clean modern look.
- When a feature touches the database or auth, use Supabase. Browser code uses `lib/supabase/client.ts`. Server Components, Server Actions, and Route Handlers use `lib/supabase/server.ts`. `proxy.ts` refreshes the auth session, then applies locale routing. Credentials live in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not commit that file.
