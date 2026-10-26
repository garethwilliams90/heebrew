# Learning flow

This file is the source of truth for the conceptual path a learner takes through Webrew: the first visit, the gated curriculum, and ideas for later levels. It records intent, not implementation.

[AGENTS.md](AGENTS.md) stays the source of truth for the tech stack, interface language and direction, how current features behave, and working agreements.

The curriculum does not rewrite Alephbet, flashcards, training, streaks, or auth. Those stay available as they are. A curriculum level opens when the learner completes the previous one. Experience still records practice, and it does not open levels or features. Aleph bet unlocks at level 3. Flashcards unlock at level 5, once level 4 is complete. Training unlocks at level 15, after level 14.

## Scope

Hebrew from scratch. A learner sees only content for their current curriculum level until they pass it. Content above that level stays locked.

Passing a level means completing that level's required set at the accuracy named below. A failed attempt can be retaken. A fail does not trap the learner on Level 0.3, Level 1, or Level 2.

The "already know some Hebrew" assessment comes later and is not specified here. Levels 3 through 14 are specified below. Level 1 covers א, ב, ג and four spoken Hebrew sound exercises. Level 2 covers א, ב, ג, ד, ה and four more spoken sound exercises.

## Start

On a first visit, the home entry offers two actions:

- **Absolute beginner? Start here** — opens Level 0L.
- **Already know some Hebrew? Take an assessment to skip levels** — a placeholder until that assessment exists.

**Title of this section: Introduction to letters**

## Level 0L 

Start here opens Level 1. The screens are labelled like a game level:

- **1.0** — hear א, ב, and ג. Each card has the letter, its name, its sound, and a control to hear the consonant. ב is shown as both ב and בּ. The full aleph-bet is shown with these three in bold blue.
- **1.1** — nikud practice for those letters.
- **1.2** — four spoken sound exercises that use only those letters. The learner hears generated Hebrew, records, and passes when Hebrew speech-to-text matches the expected word. Next stays off until that item is accepted. Skip exercise moves on when recording is unavailable.

### 0.3 / 1.2 Say the word

Speaking is scored in Hebrew, not English. The app plays a generated Hebrew sample, the learner records, and the server transcribes with Hebrew speech-to-text (`he-IL`). A pass is a match to the expected Hebrew (after stripping niqqud and punctuation). English romanization such as gah or geh is not the pass gate. Wrong answers replay the sample and retry. The microphone works in any browser that can record audio.

Levels 1, 2, and 3 include a nikud practice. The learner hears one letter from that level with a vowel, then drags one of three nikud onto the letter. The three choices are different sounds. A nikud guide sits at the top left of those levels and plays each sound on ב. The vowel set below is that guide.

## Vowel set

Later practice uses this set. It is the curriculum vowel set. It does not change the existing nikud deck.

| Nikud | Sound |
| --- | --- |
| kamatz, patach | ah |
| tsere, segol | eh |
| shva | no vowel, consonant only |
| hiriq | ee |
| kubutz, shuruk | oo |
| holam, with and without ו | oh |

## Level 1

Letters in this level: only **א, ב, ג**.

- **1.0** — a short intro to hear those three letters. ב is shown as both ב and בּ, each with its recorded consonant.
- **1.1** — nikud practice. One of א, ב, ג is shown, a vowel sound for that letter plays, and the learner drags the matching nikud from three choices that all sound different.
- **1.2** — four sound exercises, each a 2–3 letter pointed Hebrew string made only from א, ב, ג. Mix real-ish syllables and mini-words (בַּב, אַבָּא, בַּג, גַּג). Play the generated Hebrew sample, record, pass on a Hebrew match, then Next. Skip exercise moves to the next sound when the microphone cannot be used.

Passing those four speaking items unlocks Level 2.

## Level 2

Letters in this level: **א, ב, ג, ד, ה**.

- **2.0** — hear those five letters (review א ב ג, introduce ד and ה). ב is shown as both ב and בּ.
- **2.1** — nikud practice with א, ב, ג, ד, and ה. Same drag flow as level 1.
- **2.2** — four more sound exercises from letters available here (גַּד, הַא, בַּד, דָג). Same hear → record → Hebrew match → Next flow, with Skip exercise when the microphone cannot be used.

Passing those four speaking items unlocks Level 3. Real words from these exercises are saved to the Known words flashcard deck.

**Horizontal divider noting a change in section, section title: learning the aleph-bet**

## Levels 3 through 11


After level 2, each level introduces the next two letters, in aleph-bet order, starting at vav. Level 1 covers א, ב, ג. Level 2 covers the first five letters (א through ה). Level 11 is tav on its own.

All words covered in these levels should be added to the flashcard deck if they are not yet seen by the user.

| Level | Letters |
| --- | --- |
| 3 | ו ז |
| 4 | ח ט |
| 5 | י כ |
| 6 | ל מ |
| 7 | נ ס |
| 8 | ע פ |
| 9 | צ ק |
| 10 | ר ש |
| 11 | ת |

Each level opens on an intro page for its letters. Each letter shows its name, its sound, a short description, and a control to hear its consonant - use the consanant sounds recorded in hebrew_letter_sounds_24_mp3 for best audio. ב, כ, and ש each show both sounds: ב/בּ with clips 02 and 03, כ/כּ with clips 12 and 13, and שׁ/שׂ with the shin clip and the samekh clip. Below them is the whole aleph-bet, with this level's letters in bold blue, and a line giving their place in it, such as letters 6 and 7 of 22. Level 3 then runs the nikud drag practice with the letters learned so far, א through ז. Each letter then has an intro slide and one simple pointed word. Kaf, mem, nun, pe, and tsadi also show one final-form word. A practice quiz then uses only that level's letters. Passing the level opens the next one.

Hovering in the region of the level card in the level-pathway should reveal a brief description of the content covered in the lesson and give a lesson name. Example: Lesson 3: Learning ז & ו 

**horizontal divider noting a change in section: section title: words, sentences and basic grammar**


## Level 12

Nikud are not need in this level unless necessary it will overcomplicate things - let the user know that in modern Hebrew nikud are only sometimes used and words will start to become familiar and recognisable without nikud.

Begin with an intoduction to this level: now we are going to start reading real hebrew words and forming sentences - your vocabulary will really start to grow with useful words now which is essential to becoming fluent and confident. You can practice any words you learn in the flashcard "Decks" tab.

Fifty three-letter words. Do not use דּ instead use ד regular. The learner hears the word, then chooses among three spellings that use the same letters and different nikud. Shva is not a choice and no two options should be the same sound (patach and kamatz for example should not appear in the same question). Hovering a choice does not play it.

**For the following levels below we are building the sentences in the practice exercises. The learner hears the full sentence (the Hebrew target is not shown while they build) and can replay it. Word cards appear below; hovering a card shows its translation, clicking a card plays that word, and they drag or click to place the words in the right order. After they complete a sentence, the full Hebrew and a translation are shown.**

## Level 13

Introduce the level with an explanation of the concept of של what the word means literally, and how it is used in Hebrew.


Once complete the user is shown the sentence written in full, with a translation of the sentence.

Forty basic sentences built on את ה and של. של varies across שלי, שלך, שלו, שלה, שלנו, שלכם, and שלכן. An example of the shape is הוא אוכל את הדג שלי, or זה הכלב שלנו.


13.1 should focus on שלי and שלו and שלה - explain them each and let the user hear the sound they make.
13.1 Practice is 6 sentence questions using either שלי שלו or שלה

13.2 introduces שלנו and explains that זה becomes אלה when talking about plural and also addresses ״ים״ and ״ות״ suffixes for plurals. 
    Give the user 6 more sentence questions using שלנו , אלה  and plurals if relevant to the sentence.
        Example: אלה הכלבים שלנו - these are our dogs

13.3 Covers שלכם שלכן with 6 more sentence questions using these expressions, 
we can start using plurals in practice questions from now on.

13.4 Covers שלהם שלהן with another 6 practice questions using these expressions.


**horizontal divider noting a new section: section title: verbs: present tense**


## Level 14

This level should be using the sentence builder format for the practices

This level introduces the את verbs in **present tense**
Present-tense verbs that take את, such as אוהב, אוהבת, שותה, and אוכל, in the same sentence frame as level 13. Verbs with ל, על, and מ come later.

14.1 Inroduce the verb לאכול to eat and give the present tense forms, show the masculine, feminine and plurals with a basic example of הוא אוכל שוקולד, היא אוכלת שוקולד etc for all forms.
Play each verb form out loud.

14.2 Highlight the differences between הוא אוכל שוקולד and הוא אוכל את השוקולד again. the את ה pattern is very important.

14.3 sentence builder practice with אוכל 4 questions, one for each form of the present tense verb.

14.4 introduce 2 more verbs: לשתות וללמוד
14.5 practice quiz with 10 questions with a mix of the 3 verbs learned so far, with a mix of present tense forms.

## Level 15

One new present-tense verb and three new nouns, still in the את frame from level 14. Hear cards play the Duolingo bundle recording for each form and noun. The sentence builder still speaks the full sentence with Azure, because the bundle has no recording of these sentences.

15.1 Introduce לקרוא and play the four present-tense forms: קורא, קוראת, קוראים, קוראות.

15.2 Introduce עיתון, מכתב, and סיפור. Hear each noun.

15.3 Six sentence-builder questions that use לקרוא with those nouns, such as הוא קורא את העיתון and היא קוראת את המכתב.

## Level 16

Two new present-tense verbs and two new nouns. Writing reuses מכתב and סיפור from level 15.

16.1 Introduce לכתוב and play כותב, כותבת, כותבים, and כותבות.

16.2 Introduce לאהוב and play אוהב, אוהבת, אוהבים, and אוהבות.

16.3 Introduce שיר and מוזיקה. A definite song takes את. Music, like water, does not.

16.4 Eight mixed sentence-builder questions, such as הוא כותב את המכתב, היא אוהבת את השיר, and הם אוהבים מוזיקה.

## Producing levels from 14 onward

Level 14 opens the verb section. Later levels stay on the sentence-builder path. A teaching level introduces 1 or 2 new verbs and 2 or 3 new non-verb words and uses them in sentences, except where a block below says to reuse words the learner already knows. New words, including each new verb and its present-tense forms, are saved to the Known words deck. Hear cards play the bundle recording when that word has one.

Levels 17 through 40 are built. Every teaching level introduces new words. The connector bank below is taught across levels 22–40. Exams still review words the learner already has.

### A new concept every 4 levels

Count from level 14. Each block is four levels. The first level of a block opens the concept. The other teaching levels in the block keep using it. An exam replaces the last level of its eight-level run. Levels 14, 15, and 16 are already the first three levels of the את block, so level 17 finishes that block before ל begins.

| Levels | Concept |
| --- | --- |
| 14–17 | Present-tense verbs that take את. |
| 18–20 | Present-tense verbs that take ל. Present tense only. ל joins the next word: לפארק, לילד. |
| 21 | Exam of levels 14–20. |
| 22–28 | Complex sentences. New connectors from the bank, two or three a level, plus a new noun or adjective. |
| 29 | Exam of the connectors learned so far. |
| 30 | Past tense of verbs the learner already knows, with אתמול. Practice from here uses past and present. New connectors continue. |
| 31–36 | More connectors from the bank, and a new noun on each level. Sentences use past and present. |
| 37 | Exam of the past and the connectors learned so far. |
| 38–39 | The remaining connectors and new nouns. Past and present. |
| 40 | Future tense, with מחר, plus כדי ש. Practice on this level uses past, present, and future. |

The connector bank, in teaching order, is: ו, אבל, או, כי, אז, גם, רק, אלא, לכן, בעצם, כש, לפני ש, אחרי ש, בזמן ש, עד ש, מאז ש, ואז, קודם כול, בסוף, בינתיים, למשל, כלומר, זאת אומרת, במיוחד, בנוסף, חוץ מ, גם... וגם..., לא רק... אלא גם..., למרות ש, למרות זאת, מצד אחד... מצד שני..., אם, אם... אז..., אחרת, אפילו אם, בגלל ש, בגלל זה, כתוצאה מכך, במקום ש, כדי ש.

A prefix such as ו or כש is saved as its own word and appears in a sentence joined to the next word: והיא, כשהוא. מ, על, and further tenses after 40 are not in this stretch.

---

## Section 3 - Existential concepts

This section comes after Hebrew 101. It opens when that exam is passed. Each level below is one pathway level: intro slides, then the exercises named for it.

Exercise numbers are the pathway exercises: 2 recognise the sound, 3A fill the gaps, 3B choose the form that fits, 4 listen and repeat, 5 read, 6 write, 7 comprehension, 8 spell. When an exercise is marked optional, the learner can skip it.

### Level 1: Introducing יש (there is) and אין (there isn't)

This level introduces the Hebrew concepts of **יש** (yesh - there is) and **אין** (ein - there isn't). יש לי means I have. The word after ל changes with the person: לי, לך (masculine), לך (feminine), לו, לה.

**Exercises included:**
- Exercise 2
- Exercise 3A
- Exercise 3B
- Exercise 5
- Exercise 6
- Exercise 7
- Exercise 8

_(Note: Exercise 4 is intentionally skipped)_

**Sentences:**
- יש דג — there is a fish
- אין גלידה — there is no ice cream
- יש ספר — there is a book
- אין בית — there is no house
- יש לי כלב — I have a dog
- אין לי לחם — I don't have bread
- יש לו ספר — he has a book
- יש לה מים — she has water

### Level 2: Age and Numbers

This level teaches how to state and ask about age in Hebrew.

**Statement forms:**
- אני בן (ani ben - I am [age], masculine) + numbers
- אני בת (ani bat - I am [age], feminine) + numbers

**Question forms:**
- בן כמה אתה (ben kama ata - how old are you, to a male)
- בת כמה את (bat kama at - how old are you, to a female)

**Numbers after בן and בת:** שנה (1), שנתיים (2), שלוש, ארבע, חמש, שש, שבע, שמונה, תשע, עשר, עשרים, שלושים, מאה, and אפס for zero.

**Sentences:**
- אני בן שנה — I am 1 (masculine)
- אני בן עשר — I am 10 (masculine)
- אני בן עשרים — I am 20 (masculine)
- אני בן שנתיים — I am 2 (masculine)
- אני בת שבע — I am 7 (feminine)
- אני בת שלושים — I am 30 (feminine)
- בן כמה אתה — how old are you (to a man)
- בת כמה את — how old are you (to a woman)

Exercises: 2, 3A, 3B, 4 (optional), 5, 6, 8.

### Level 3: Basic Interactions - Ordering Coffee in a Coffee Shop

This level covers a full interaction scenario between a customer and waiter/waitress at a coffee shop.

**Customer side sentences:**
- שלום (shalom - hello)
- מה נשמע (ma nishma - how are you) or מה קורה (ma koreh - what's up)
- אפשר להזמין (efshar lehazmin - can I order)
- אפשר בבקשה הפוך (efshar bevakasha hafuch - can I have a hafuch please)
- אפשר בבקשה קפה קר (efshar bevakasha kafe kar - can I have an iced coffee please)
- אספרסו (espresso)
- וקרואסון (ve kuason - and a croissant)

**Waiter/waitress side sentences:**
- מה אתה רוצה (ma ata rotzeh - what do you want, masculine)
- מה את רוצה (ma at rotza - what do you want, feminine)
- זה לשבת או לקחת (ze leshevet o liktoach - is this to sit in or take away)
- אתם רוצים (atem rotzim - you want, plural)
- איך אתם משלמים (eich atem meshalmim - how are you paying, plural)
- איך אתה משלם (eich ata meshalem - how are you paying, masculine)
- עם אשראי או מזומן (im ashray o mezuman - with card or cash)

Exercises: 2, 3A, 3B, 4 (optional), 5, 7, 8.

---

### An exam every 8 levels

Count from level 14. Every 8th level is an exam: **21, 29, 37**. The built path stops at level 40, so the next exam, 45, is not part of this stretch. The exam is the last level of that run of eight. It does not introduce a new concept or new words. It reviews what those levels taught.

The exam uses the sentence builder, with these differences:

- The learner has 3 lives. A wrong sentence costs one life. At zero lives the attempt fails and can be retaken.
- There is no hint.
- Clicking a word card places it and does not play that word. Hearing the full sentence stays available.
- The word bank includes extra words the learner knows that are not part of the sentence. Only one order is correct. The extra words are left unused.
