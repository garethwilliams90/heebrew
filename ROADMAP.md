# Heebrew roadmap

Plan from the architectural assessment and later phase work. There is no older roadmap file in the repo; this is the standing record.

**Current `main`:** `38713bd` (Training Center, PR #17).

---

## Phase 1 — Foundation (done on `main`)

Service layer, API middleware, and repository pattern. Thin slices, already merged.

- Service / DI scaffolding (`BaseService`, `ServiceContainer`)
- API response helpers
- `withAuth` on cards and Anki routes
- `CardRepository` writes
- `ProgressRepository` reads and writes
- `AuthService` (exists; not registered on the container)

**Leftover cleanup (not required to close Phase 1)**

- No `DeckRepository` — `library.ts` still talks to `decks` for create/update/delete; `app/api/anki/import/route.ts` inserts/deletes `cards` and `decks` directly
- Progress deletes — `deleteDeck` / `removeCard` in `library.ts` still wipe `card_progress` inline
- Thin `requireUser()` wrappers in `library.ts` and `progress.ts` only forward to `requireBrowserUser()`
- `app/api/speech/score/route.ts` still calls `getUser()` itself
- `AuthService` unused; `ServiceContainer` has no registered services

---

## Phase 2 — Launch readiness (deferred)

Wait until closer to launch and payments.

- Real service modules beyond `BaseService` / `ServiceContainer` scaffolding
- Payments
- More database surface

---

## Phase 3 — Optimization (in progress)

Chosen before Phase 2 because the app is not close to launch or payments.

**Branch:** `cursor/phase-3-optimization-76a1`  
**Status:** four commits ahead of `main` at `38713bd`. On origin, targeting `main`.

### Rounds 1–4 (done on the branch)

Shared chrome and small performance wins. Same lens: cleaner, modular, reusable, readable. Low-risk only.

- Hear tiles, cues, gates
- Quiz chrome and study setup fields
- Swipe-study grade bar, keyboard hook, speech-clip cache
- `LeafHeroScreen` for finish screens
- Replay-pulse button
- Deck-browser speech cache
- `LetterCard` memo
- `next/dynamic` lazy loading on learn / decks / letter-study

### Still open

**Deeper session split**

- `flashcard-session.tsx` (~716 lines) and `letter-study.tsx` (~470 lines)
- No session machine or context
- Data fetching still lives in the views

**DRY leftovers**

- Browser `getUser()` copies in `catalog.ts`, `daily-practice.ts`, `experience.ts`, `home-stats.ts`, `known-words.ts`
- Silent `catch {}` in `library.ts`, `apkg.ts`, `record-clip.ts`, and others
- Speech routes stay unsigned-in by design — do not wrap them in `withAuth`

**Caching (not started)**

- Unbounded maps: `lib/azure/speech.ts` (`ttsCache`), `progress.ts` (`deckMemoryLoads`), `experience.ts` (`experienceLoad`), `deck-speech.ts`, `speech-clip.ts`
- No `lib/cache` or `CacheManager` (in-memory LRU + TTL; Redis later)

### Standing do-not-merge rules

- `letter-card.tsx` grid flip vs `swipe-card.tsx` `SwipeCard`
- `SoundQuiz` in `letter-quiz.tsx` vs `TrainingChoice` in `training-choice.tsx`

---

## Phase 4 — Upcoming (unspecified)

Mentioned as later work (API versioning, feature flags, observability were named as out of Phase 3). Details were not written down. Treat as upcoming until scoped.
