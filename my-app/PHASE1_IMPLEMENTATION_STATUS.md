# Phase 1: Core Vocabulary Tables - Implementation Status

## Completed

### 1. Database Schema
✅ **File:** `supabase/migrations/20261025140000_create_vocabulary_core_tables.sql`

Created 4 core tables:
- `vocabulary_words` - Master vocabulary list (shared across all users)
- `word_examples` - Example sentences for each word  
- `word_conjugations` - Verb conjugations (all tenses, persons, genders)
- `word_media` - Audio recordings and images

Created 2 storage buckets:
- `vocabulary-audio` (public) - Professional/native speaker recordings
- `word-images` (public) - Word illustrations and photos

Includes:
- Row Level Security (RLS) policies
- Indexes for performance
- Constraints for data integrity
- Helper functions and triggers

### 2. Progress Tracking Schema (Draft)
✅ **File:** `supabase/migrations/DRAFT_20261025150000_user_progress_tracking.sql`

Drafted Phase 2 tables (not yet applied):
- `user_word_progress` - Per-user mastery tracking with SM-2 spaced repetition
- `user_audio` - User-recorded audio
- `user_lesson_progress` - Lesson completion tracking (commented out, requires Phase 3)

Created storage bucket:
- `user-vocabulary-audio` (private, user-scoped)

Includes:
- SM-2 algorithm helper function `calculate_next_review()`
- Integration notes with Phase 1 tables
- Example queries

### 3. Data Migration Script
✅ **File:** `scripts/migrate-catalog-to-supabase.mjs`

Node.js script to migrate `lib/learn/words/catalog.json` (40 words) into Supabase:
- Reads catalog.json
- Maps to vocabulary_words schema
- Upserts words (insert or update)
- Creates word_media entries for audio files
- Reports migration stats

## Next Steps

### Immediate (Complete Phase 1)

1. **Apply Phase 1 Migration**
   ```bash
   cd my-app
   supabase db reset  # or supabase db push
   ```

2. **Run Data Migration**
   ```bash
   # Load environment variables
   source .env.local
   
   # Run migration script
   node scripts/migrate-catalog-to-supabase.mjs
   ```

3. **Verify Migration**
   ```sql
   -- Check word count
   select count(*) from vocabulary_words;
   
   -- Check a sample word
   select * from vocabulary_words where word_key = 'dag';
   
   -- Check audio entries
   select count(*) from word_media where media_type = 'audio';
   ```

4. **Create Migration Script for Duolingo Vocabulary**
   - Script: `scripts/migrate-duolingo-to-supabase.mjs`
   - Migrate 10,664 words from `public/hebrew_duolingo_app_bundle/vocabulary.json`
   - Parse Anki JSON format
   - Extract audio paths
   - Calculate difficulty and frequency rankings

### Phase 2 (Future)

- Apply progress tracking tables migration
- Create UI components for user audio recording
- Implement spaced repetition logic
- Add user progress dashboard

### Phase 3 (Future)

- Lesson/curriculum tables
- Sentence generation system
- Grammar rules engine

## Files Created

```
my-app/
├── supabase/migrations/
│   ├── 20261025140000_create_vocabulary_core_tables.sql
│   └── DRAFT_20261025150000_user_progress_tracking.sql
└── scripts/
    └── migrate-catalog-to-supabase.mjs
```

## Testing Locally

1. **Start Supabase locally:**
   ```bash
   cd my-app
   supabase start
   ```

2. **Apply migrations:**
   ```bash
   supabase db reset
   ```

3. **Run data migration:**
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   node scripts/migrate-catalog-to-supabase.mjs
   ```

4. **Query data:**
   ```bash
   supabase db studio  # Opens web UI
   # or
   psql postgresql://postgres:postgres@localhost:54322/postgres
   ```

## Schema Highlights

### vocabulary_words
- **word_key**: Unique stable identifier (e.g., "dag", "shalom")
- **difficulty_level**: 1-10 scale for progression
- **tags**: Array for flexible categorization
- **hebrew_variations**: JSONB for alternative forms

### word_conjugations  
- **Composite unique key**: (word_id, tense, person, gender, number)
- **Supports all tenses**: present, past, future, imperative, infinitive
- **Gender-aware**: masculine/feminine forms

### word_media
- **Multiple recordings**: Native, synthetic, user recordings
- **Dialect support**: Standard, Moroccan, Yemenite, etc.
- **Default flag**: Mark preferred audio for each word

## Performance Considerations

- **Indexes added** on frequently queried columns:
  - word_key, difficulty_level, part_of_speech
  - GIN index on tags array
  - Updated_at for incremental syncs

- **RLS enabled** but currently allows public read:
  - Everyone can read vocabulary (shared content)
  - User-specific tables restricted to owner

## Data Integrity

- **Foreign key constraints** ensure referential integrity
- **Check constraints** validate:
  - Difficulty levels (1-10)
  - Part of speech (enumerated values)
  - Gender (masculine/feminine/null)
  - String lengths (prevent abuse)

## Next Migration: Duolingo Vocabulary

The Duolingo bundle contains ~10,664 words with this structure:

```json
{
  "id": "anki-note-...",
  "source": {
    "original_fields": {
      "Hebrew": "האם",
      "Niqqud": "הַאִם",
      "Transliteration": "ha'im",
      "Translation": "Is…?",
      "Gender": "",
      "Number": "Singular",
      "Type": "Interrogative",
      "Audio": "[sound:file.mp3]",
      "Tags": "01. Letters 1"
    }
  }
}
```

Mapping strategy:
- **word_key**: Generate from Hebrew (normalize, no niqqud)
- **difficulty_level**: Calculate from Tags (01.=level 1, etc.)
- **frequency_rank**: Use card statistics
- **Audio**: Extract from `[sound:...]` format, map to storage path
