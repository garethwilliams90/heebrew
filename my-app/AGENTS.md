<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Webrew

Webrew is an interactive, modern, fully responsive web app for Hebrew learners at every level, from total beginners to advanced speakers. It should feel easy and intuitive: a sleek UI, clean smooth animations, and a subtle nature theme that shows up in logos, icons, and sound effects.

The app lives in this Next.js project (`my-app`). The repo root README describes it as a Hebrew language learning platform for all levels.

## Tech stack

Use only this stack unless the owner explicitly requests or approves a deviation:

- Next.js, TypeScript, React
- Tailwind CSS
- shadcn/ui for components
- Supabase for authentication and the database
- `use-sound` for sound effects
- `next-intl` for interface languages

## Language and direction

Interface languages are English, French, and Spanish, for learners in Europe. English is the default. The interface stays left-to-right for every interface language. Set `dir="ltr"` on the document and `lang` to the active locale (`en`, `fr`, or `es`).

Use `next-intl` for interface copy. Locales and routing live in `i18n/routing.ts`. Messages live in `messages/en.json`, `messages/fr.json`, and `messages/es.json`. The default locale is served at `/`. French and Spanish use `/fr` and `/es`. Use the navigation helpers in `i18n/navigation.ts` for internal links so the locale prefix is kept.

Hebrew study content (words, sentences, answers) is still right-to-left. Mark those strings with `dir="rtl"` and `lang="he"` on the element that contains them. Hebrew is not an interface language.

Keep the interface responsive on mobile and desktop.

## Features

Build these in roughly this order. Feature 5 is low priority.

### 1. Flashcards with spaced repetition

Learners study words on flashcards. Each word has a mastery level from 0 to 6:

- 0 is unknown
- 6 is mastered

A correct recall moves the word up one level. Intervals between reviews grow longer as the level rises.

### 2. Training centre

A practice area for more nuanced Hebrew, including tenses and choosing the correct verb binyan (בניין). The learner sees a sentence with one or two words blank, plus three multiple-choice options for the correct response.

### 3. Levels, experience, and a leaderboard

Users earn experience points for correct answers and completed training exercises. A basic levelling system tracks that progress. A leaderboard lists all users and their levels.

### 4. Streaks

A daily streak, in the spirit of Duolingo: practising a set amount in a day increases the streak. A high streak also contributes experience.

### 5. Gendered-word images (low priority)

For masculine and feminine words on flashcards, generate images with AI. Example: a masculine table, גבר / שולחן.

### 6. Authentication

Login, logout, and registration through Supabase. Email and password are at `/login` and `/sign-up`. Google uses the same screens and returns through `/auth/confirm`. Phone and GitHub come after those providers are configured in Supabase.

## Working agreements

- Do not add libraries, services, or UI kits outside the stack above unless the owner asks for them or approves them first.
- Prefer the existing Next.js App Router project. Read `node_modules/next/dist/docs/` before using Next.js APIs that may have changed.
- Keep UI work consistent with the nature theme, smooth motion, and a clean modern look.
- When a feature touches the database or auth, use Supabase. Browser code uses `lib/supabase/client.ts`. Server Components, Server Actions, and Route Handlers use `lib/supabase/server.ts`. `proxy.ts` refreshes the auth session, then applies locale routing. Credentials live in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not commit that file.
