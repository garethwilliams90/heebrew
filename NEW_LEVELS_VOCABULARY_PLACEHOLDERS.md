# New Levels Implementation - Vocabulary Placeholders

## Overview
This document describes the new level files created for the Hebrew learning curriculum. Each file contains a structured placeholder where vocabulary sentences will be added later.

## Created Level Files

### 1. `/workspace/my-app/lib/learn/level-ahava.ts`
**Purpose:** Ahava (Love/Like) verb level - Hebrew Fundamentals Section 2

**Vocabulary Placeholders:**
- `loveForms`: Array for present tense verb forms (ohev, ohevet, ohavim, ohavot)
  - Location: Lines 19-24
  - Status: Empty, commented examples provided
  
- `practiceSentences`: Array for practice sentences using לאהוב
  - Location: Lines 29-32
  - Status: Empty, example structure in comments
  
- `ahavaKnownWords`: Array for vocabulary words introduced in this level
  - Location: Lines 40-43
  - Status: Empty, example structure in comments

**Exports:**
- `loveForms`: Verb form cards for UI display
- `ahavaBank`: All practice sentences
- `ahavaPractice()`: Returns 6 sentences for practice
- `ahavaKnownWords`: Words to add to learner's vocabulary

---

### 2. `/workspace/my-app/lib/learn/level-ratzon.ts`
**Purpose:** Ratzon (Want) verb level - Present tense: ani rotze, rotze, rotzim, rotzot

**Vocabulary Placeholders:**
- `wantForms`: Array for present tense verb forms
  - Location: Lines 27-32
  - Status: Empty, commented examples provided
  - Forms needed: rotze (m.s.), rotza (f.s.), rotzim (m.p.), rotzot (f.p.)
  
- `practiceSentences`: Array for practice sentences using לרצות
  - Location: Lines 35-39
  - Status: Empty with example structure
  - Should include example: "ani rotze okhel" (I want food)
  
- `ratzonKnownWords`: Array for vocabulary words
  - Location: Lines 47-50
  - Status: Empty, example structure in comments

**Exports:**
- `wantForms`: Verb form cards for UI display
- `ratzonBank`: All practice sentences
- `ratzonPractice()`: Returns 6 sentences for practice
- `ratzonKnownWords`: Words to add to learner's vocabulary

---

### 3. `/workspace/my-app/lib/learn/level-age.ts`
**Purpose:** Age and Numbers level - Statements and questions (בן כמה אתה? בת כמה את?)

**Vocabulary Placeholders:**
- `ageForms`: Array for age statement and question forms
  - Location: Lines 28-35
  - Status: Empty, commented examples provided
  - Statement forms: ani ben (masculine), ani bat (feminine)
  - Question forms: ben kama ata? (to male), bat kama at? (to female)
  
- `basicNumbers`: Array for numbers 0-9
  - Location: Lines 38-43
  - Status: Empty, should add efes, echad, shtayim, etc. through 9
  
- `practiceSentences`: Array for practice with age statements and questions
  - Location: Lines 46-50
  - Status: Empty, example structure in comments
  
- `ageKnownWords`: Array for numbers and age-related vocabulary
  - Location: Lines 58-62
  - Status: Empty, example structure in comments

**Exports:**
- `ageForms`: Age statement and question cards
- `basicNumbers`: Number cards 0-9
- `ageBank`: All practice sentences
- `agePractice()`: Returns 6 sentences for practice
- `ageKnownWords`: Words to add to learner's vocabulary

---

### 4. `/workspace/my-app/lib/learn/level-coffee.ts`
**Purpose:** Coffee Shop Interaction level - Full customer/waiter conversation

**Vocabulary Placeholders:**
- `customerPhrases`: Array for customer-side phrases
  - Location: Lines 34-43
  - Status: Empty, commented list of 8 phrases
  - Phrases: shalom, ma nishma, ma koreh, efshar lehazmin, efshar hafuch, efshar kafe kal, espresso, ve kuason
  
- `waiterPhrases`: Array for waiter/waitress phrases
  - Location: Lines 46-56
  - Status: Empty, commented list of 7 phrases
  - Phrases: ma ata rotzeh, ma at rotza, ze leshevet o liktoach, atem rotzim, eich atem meshalmim, eich ata meshalem, im ashray o mezuman
  
- `practiceSentences`: Array for full interaction sequences
  - Location: Lines 59-63
  - Status: Empty, example structure in comments
  
- `coffeeKnownWords`: Array for coffee shop vocabulary
  - Location: Lines 71-75
  - Status: Empty, example structure in comments

**Exports:**
- `customerPhrases`: Customer phrase cards
- `waiterPhrases`: Waiter/waitress phrase cards
- `coffeeBank`: All practice sentences
- `coffeePractice()`: Returns 8 sentences for practice
- `coffeeKnownWords`: Words to add to learner's vocabulary

---

### 5. `/workspace/my-app/lib/learn/level-yesh-ein.ts`
**Purpose:** Yesh/Ein (There is/There isn't) level - Section 3, Level 1

**Vocabulary Placeholders:**
- `yeshEinForms`: Array for yesh/ein concept cards
  - Location: Lines 22-25
  - Status: Empty, commented examples provided
  
- Exercise arrays (separate arrays for each exercise):
  - `exercise2`: Lines 28-30
  - `exercise3A`: Lines 33-35
  - `exercise3B`: Lines 38-40
  - `exercise5`: Lines 43-45
  - `exercise6`: Lines 48-50
  - `exercise7`: Lines 53-55
  - `exercise8`: Lines 58-60
  - Status: All empty, ready for sentences
  - Note: Exercise 4 is intentionally skipped
  
- `yeshEinKnownWords`: Array for vocabulary words
  - Location: Lines 90-93
  - Status: Empty, example structure in comments

**Exports:**
- `yeshEinForms`: Concept cards for yesh/ein
- `yeshEinBank`: All exercise sentences combined
- Individual exercise functions: `yeshEinExercise2()`, `yeshEinExercise3A()`, `yeshEinExercise3B()`, `yeshEinExercise5()`, `yeshEinExercise6()`, `yeshEinExercise7()`, `yeshEinExercise8()`
- `yeshEinKnownWords`: Words to add to learner's vocabulary

---

## How to Add Vocabulary

### Step 1: Define Word Constants
At the top of each level file, define word constants using the `word()` helper:

```typescript
const shalom = word("שלום", "hello", "bonjour", "hola");
const ani = word("אני", "I", "je", "yo");
const rotze = word("רוצה", "want", "veux", "quiero");
```

Format: `word(hebrew, english, french, spanish, optional_audio_path)`

### Step 2: Populate HearCard Arrays
Add entries to the card arrays (loveForms, wantForms, ageForms, etc.):

```typescript
export const wantForms: readonly HearCard[] = [
  { id: "rotze", hebrew: "רוֹצֶה", label: "formMs" },
  { id: "rotza", hebrew: "רוֹצָה", label: "formFs" },
  { id: "rotzim", hebrew: "רוֹצִים", label: "formMp" },
  { id: "rotzot", hebrew: "רוֹצוֹת", label: "formFp" },
];
```

### Step 3: Add Practice Sentences
Use the `sentence()` helper to build practice sentences:

```typescript
const practiceSentences: readonly BuilderSentence[] = [
  sentence("ani-rotze-ochel", 
    { en: "I want food", fr: "Je veux de la nourriture", es: "Quiero comida" }, 
    [ani, rotze, ochel]
  ),
  sentence("hi-rotza-kafe", 
    { en: "She wants coffee", fr: "Elle veut du café", es: "Ella quiere café" }, 
    [hi, rotza, kafe]
  ),
];
```

Format: `sentence(unique_id, {en, fr, es}, [word1, word2, word3, ...])`

### Step 4: Add Known Words
Populate the knownWords array:

```typescript
export const ratzonKnownWords: readonly BasicWord[] = [
  { id: "rotze", hebrew: "רוֹצֶה", english: "want", reading: "rotze", partOfSpeech: "verb", gender: "masculine" },
  { id: "ochel", hebrew: "אוֹכֶל", english: "food", reading: "okhel", partOfSpeech: "noun", gender: "masculine" },
];
```

---

## Integration Status

### ⚠️ Not Yet Integrated
These level files are **created but not yet wired into the app**. To complete integration:

1. **Assign Level Numbers:** Decide which curriculum level numbers (e.g., 17-21 or custom numbering) these should use
2. **Update Routing:** Modify `/workspace/my-app/app/[locale]/learn/page.tsx` to route to these levels
3. **Create Component Steps:** Update or create UI components (similar to `SentenceLevel`) to render these levels with their specific step flows
4. **Add i18n Keys:** Add translation keys to `messages/en.json`, `messages/fr.json`, `messages/es.json` for level titles, instructions, etc.
5. **Update Level Path:** Add level cards to the home screen level path so learners can access them

---

## Custom Recordings

For audio recordings, use the optional `audio` parameter in the `word()` helper:

```typescript
const shalom = word("שלום", "hello", "bonjour", "hola", "audio/shalom.mp3");
```

Audio paths should be relative to `public/hebrew_duolingo_app_bundle/`.

If no audio path is provided, the app will use Azure Text-to-Speech to generate Hebrew audio at runtime.

---

## Next Steps for the Caller

1. Add vocabulary sentences to each of the 5 level files following the patterns documented above
2. Add any custom audio recordings to the appropriate directory
3. Decide on level numbering within the curriculum flow
4. Wire up routing and UI components
5. Test each level to ensure sentences display and audio plays correctly
