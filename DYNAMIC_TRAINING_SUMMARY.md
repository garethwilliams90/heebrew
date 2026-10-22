# Dynamic Training Question Generator - Prototype Summary

## Overview

This prototype replaces the hard-coded training questions with a dynamic system that generates questions based on the user's known verbs. The system includes:

1. **Verb Conjugation Data Store**: Comprehensive database of regular verbs with all conjugated forms
2. **Sentence Templates**: Level-based templates for question generation
3. **Distractor Logic**: Smart generation of wrong answers based on user level
4. **Dynamic Question Generation**: Combines verbs, templates, and distractors to create questions
5. **Enhanced UI**: Clickable verb blanks that show full conjugation tables

## Files Created

### Core Data Files

1. **`/workspace/my-app/lib/training/verb-conjugations.ts`**
   - Contains 9 regular verbs across 3 binyanim (pa'al, pi'el, hif'il)
   - Each verb has root, infinitive, English translation, and all conjugated forms
   - Forms are tagged with tense, person, gender, and number
   - Helper functions to find verbs and get specific forms

2. **`/workspace/my-app/lib/training/sentence-templates.ts`**
   - 18 sentence templates across 3 levels
   - Level 1: Present tense (beginner)
   - Level 2: Past tense (intermediate)
   - Level 3: Future tense (advanced)
   - Each template specifies required verb form (tense/person/gender/number)

3. **`/workspace/my-app/lib/training/dynamic-questions.ts`**
   - Core question generation logic
   - Identifies user's known verbs from their flashcard list
   - Determines user level based on verb count
   - Generates "near" distractors (same root, wrong form)
   - Generates "far" distractors (different binyan or verb)
   - Adjusts distractor difficulty based on user level:
     - Level 1: 20% near, 80% far (easier)
     - Level 2: 50% near, 50% far (medium)
     - Level 3: 80% near, 20% far (harder)

### UI Components

4. **`/workspace/my-app/components/training/verb-conjugation-modal.tsx`**
   - Modal overlay showing full verb conjugation table
   - Tabbed interface for Past/Present/Future tenses
   - Displays all forms with person, number, and gender labels
   - Clean, modern UI matching the app's emerald theme

### Modified Files

5. **`/workspace/my-app/lib/training/round.ts`**
   - Updated to call dynamic question generator by default
   - Falls back to hard-coded questions if generation fails
   - Adds verb metadata to questions for conjugation viewing
   - Maintains backward compatibility with existing system

6. **`/workspace/my-app/components/training/blank-sentence.tsx`**
   - Made verb blanks clickable (highlighted on hover)
   - Accepts optional `onBlankClick` callback
   - Triggers verb conjugation modal when clicked

7. **`/workspace/my-app/components/training/training-session.tsx`**
   - Added verb conjugation modal state management
   - Passes verb data to BlankSentence component
   - Shows modal when user clicks on verb blank

## Verb Database Contents

### Pa'al Verbs (3)
- **כתב** (write) - לִכְתֹּב
- **שמר** (guard) - לִשְׁמֹר  
- **לבש** (wear) - לִלְבֹּשׁ

### Pi'el Verbs (3)
- **דבר** (speak) - לְדַבֵּר
- **שבר** (break) - לְשַׁבֵּר
- **סדר** (arrange) - לְסַדֵּר

### Hif'il Verbs (3)
- **גדל** (enlarge) - לְהַגְדִּיל
- **זכר** (remind) - לְהַזְכִּיר
- **סבר** (explain) - לְהַסְבִּיר

Each verb has 21-24 conjugated forms covering:
- Past: 9 forms (all persons, genders, numbers)
- Present: 4 forms (masculine/feminine, singular/plural)
- Future: 8-9 forms (all persons, genders, numbers)

## How It Works

### Question Generation Flow

1. **Identify Known Verbs**
   - Scans user's known-words list for verbs
   - Matches them against the verb conjugation database
   - Falls back to first 3 verbs if user has none

2. **Determine User Level**
   - Level 1: 0-2 known verbs (beginner)
   - Level 2: 3-5 known verbs (intermediate)
   - Level 3: 6+ known verbs (advanced)

3. **Select Template**
   - Filters templates by user level (shows level 1-2 templates for level 2 users)
   - Randomly picks a template

4. **Get Correct Form**
   - Uses template's verb requirement to find the correct conjugated form
   - Example: "present, third person, masculine, singular" → "כּוֹתֵב"

5. **Generate Distractors**
   - **Near distractors**: Same verb, but wrong tense/person/gender
     - Wrong tense: "כָּתַב" (past) instead of "כּוֹתֵב" (present)
     - Wrong person: "כּוֹתְבִים" (plural) instead of "כּוֹתֵב" (singular)
   - **Far distractors**: Different binyan or completely different verb
     - Different binyan: "מְדַבֵּר" (pi'el) instead of "כּוֹתֵב" (pa'al)

6. **Select Final Distractors**
   - Picks 2 distractors based on level distribution
   - Shuffles correct answer and distractors

7. **Fill Template**
   - Replaces `{verb}` placeholder with blank
   - Stores correct answer and distractors as choices

### Conjugation View

When a user clicks on a verb blank:
1. Opens modal with full conjugation table
2. Shows verb infinitive, root, binyan, and English meaning
3. Tabs for Past/Present/Future tenses
4. Lists all forms with person, number, gender labels
5. Hebrew text displayed RTL with proper formatting

## Testing Instructions

### 1. Start the Development Server

```bash
cd /workspace/my-app
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Navigate to Training Center

1. Open the app in your browser
2. Navigate to `/training` (or click Training in the navigation)
3. You may need to be logged in and at level 15+ (check `AGENTS.md` for unlock level)

### 3. Test with Default Verbs

Since you likely don't have verbs in your known-words list, the system will use the first 3 verbs as fallback:
- לִכְתֹּב (write)
- לִשְׁמֹר (guard)
- לִלְבֹּשׁ (wear)

### 4. Test Dynamic Question Generation

1. Click "Start Training"
2. Observe 5 questions being generated
3. Check that questions use different verbs and sentence structures
4. Verify choices include 1 correct answer + 2 distractors

### 5. Test Verb Conjugation View

1. During a question, click on the blank line (the underlined space)
2. A modal should open showing the full conjugation table
3. Switch between Past/Present/Future tabs
4. Verify all forms are displayed with proper Hebrew RTL formatting
5. Close the modal by clicking X or clicking outside

### 6. Test Distractor Quality

Check the distractors:
- Should include forms that are similar but wrong (near)
- Should include forms that are obviously different (far)
- At level 1, most should be obviously wrong
- As you add more known verbs, distractors should get harder

### 7. Add Test Verbs to Known Words (Optional)

To test with more verbs, you can add them to your known words by:

1. Going through the learning curriculum to learn verbs naturally, OR
2. Adding test data via browser console:
   ```javascript
   // Open browser console (F12)
   const testVerbs = [
     { id: "test-write", hebrew: "כּוֹתֵב", english: "write", reading: "kotev", partOfSpeech: "verb", gender: null },
     { id: "test-speak", hebrew: "מְדַבֵּר", english: "speak", reading: "medaber", partOfSpeech: "verb", gender: null }
   ];
   
   const existing = JSON.parse(localStorage.getItem("webrew.known-words") || "[]");
   localStorage.setItem("webrew.known-words", JSON.stringify([...existing, ...testVerbs]));
   ```
   Then refresh the page and start training.

### 8. Expected Behavior

**Successful Generation:**
- Questions appear with Hebrew sentences and blanks
- Three choices appear as cards
- One is correct, two are distractors
- Clicking blank shows conjugation modal
- Progress through 5 questions
- Experience points awarded at end

**Fallback Mode:**
- If dynamic generation fails, system falls back to hard-coded questions
- Hard-coded questions won't have clickable verb blanks
- You can check the browser console for any errors

## Testing Checklist

- [ ] Questions generate successfully (5 questions appear)
- [ ] Questions use Hebrew verbs from the database
- [ ] Sentences have proper RTL formatting
- [ ] Blank is clickable and highlighted on hover
- [ ] Conjugation modal opens when clicking blank
- [ ] Modal shows correct verb information (root, binyan, English)
- [ ] Tense tabs work (Past/Present/Future)
- [ ] All conjugated forms display correctly
- [ ] Modal can be closed (X button or clicking outside)
- [ ] Three choices appear for each question
- [ ] Choices include similar-looking forms (good distractors)
- [ ] Correct answer is marked after selection
- [ ] Questions vary across different tenses/persons
- [ ] System works without known verbs (fallback to default verbs)
- [ ] Experience points awarded after completing 5 questions

## Known Limitations (Prototype)

1. **Limited Verb Set**: Only 9 verbs across 3 binyanim
2. **Regular Verbs Only**: No irregular verbs (יכול, הלך, etc.)
3. **Active Binyanim Only**: No passive forms or nif'al
4. **Simple Templates**: No complex sentences with multiple blanks
5. **Basic Level Detection**: Uses verb count, not actual proficiency
6. **No Persistence**: Doesn't remember which questions were shown
7. **Static Templates**: Pre-written sentences, not truly generative
8. **Limited Distractors**: May reuse same distractors if verb pool is small

## Future Enhancements

1. Add more verbs (target: 50-100 verbs)
2. Include irregular verbs with special handling
3. Add nif'al, pu'al, huf'al binyanim
4. Track question history to avoid repetition
5. Adaptive difficulty based on performance
6. Generate templates dynamically
7. Support multiple blanks per sentence
8. Add infinitive and imperative forms
9. Include nikud toggling in conjugation view
10. Add audio pronunciation for each form

## Troubleshooting

**No questions appear:**
- Check browser console for errors
- Verify the build succeeded (run `npm run build`)
- Check that training unlocks at your level (currently level 15+)

**Conjugation modal doesn't open:**
- Ensure you're using dynamically generated questions (check browser console)
- Hard-coded questions don't have verb metadata
- Try starting a new training round

**Distractors are too easy/hard:**
- System adjusts based on number of known verbs
- Add more verbs to your known-words to increase difficulty
- Current levels: 1 (0-2 verbs), 2 (3-5 verbs), 3 (6+ verbs)

**Hebrew text appears LTR:**
- Check that `dir="rtl"` and `lang="he"` are set
- This should be automatic in all Hebrew text elements
- Report as a bug if text direction is wrong

## Files Summary

**New Files (5):**
- `lib/training/verb-conjugations.ts` (470 lines)
- `lib/training/sentence-templates.ts` (140 lines)
- `lib/training/dynamic-questions.ts` (250 lines)
- `components/training/verb-conjugation-modal.tsx` (90 lines)

**Modified Files (3):**
- `lib/training/round.ts` (added dynamic generation)
- `components/training/blank-sentence.tsx` (added click handler)
- `components/training/training-session.tsx` (added modal state)

**Total New Code:** ~950 lines
**Total Modified:** ~50 lines

## Build Status

✅ Build succeeded with no errors
✅ TypeScript compilation passed
✅ All imports resolved correctly
✅ Production build ready

---

**Prototype Complete!** The dynamic training question generator is now functional and ready for testing.
