# Hebrew Duolingo Anki — App Data Bundle

## Contents
- `vocabulary.json`: all Anki notes, preserving duplicates and grammatical variants.
- `audio/`: extracted media files referenced by notes, with collision-safe local filenames.
- `metadata/decks.json`: deck hierarchy and card counts.
- `metadata/tags.json`: Anki tag registry and tag frequencies.
- `metadata/field_schema.json`: source model fields and field presence counts.
- `metadata/audio_manifest.json`: original media filename to local path mapping.
- `metadata/validation_report.json`: validation results.

## Vocabulary schema
Each entry includes a stable app ID, original Anki identifiers and fields, Hebrew text, niqqud, transliteration, translations, grammar, audio paths, categories, illustration placeholders, and empty enrichment fields.

## Audio
Audio is stored locally under `audio/`. `audio[].path` is relative to this bundle root. Filenames are sanitised and prefixed with a short hash to avoid collisions. The original Anki media filename remains in `audio[].original_filename` and `metadata/audio_manifest.json`.

## Licensing
This bundle is a conversion of the user-provided Anki package. Check the original deck's terms and rights before redistributing its vocabulary, recordings, or other media in a commercial app.
