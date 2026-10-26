#!/usr/bin/env node

/**
 * Phase 2 Data Migration: Load Duolingo Hebrew vocabulary into Supabase
 * 
 * This script migrates 10,664 words from the Duolingo Hebrew Anki deck
 * (public/hebrew_duolingo_app_bundle/vocabulary.json) into the vocabulary_words
 * and word_media tables in Supabase.
 * 
 * Run from my-app directory:
 *   node scripts/migrate-duolingo-to-supabase.mjs [--limit N] [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line args
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : null;
const dryRun = args.includes('--dry-run');

// Load Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Normalize Hebrew text (remove niqqud for generating keys)
function normalizeHebrew(text) {
  if (!text) return '';
  // Remove niqqud (Hebrew vowel marks) - Unicode range \u0591-\u05C7
  return text.replace(/[\u0591-\u05C7]/g, '').trim();
}

// Generate a stable word key from Hebrew text
function generateWordKey(hebrew) {
  const normalized = normalizeHebrew(hebrew);
  // Replace spaces with hyphens, remove special characters
  return normalized
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FF\-]/g, '')
    .toLowerCase();
}

// Map Duolingo part of speech to our schema
function mapPartOfSpeech(type) {
  const typeMap = {
    'Noun': 'noun',
    'Verb': 'verb',
    'Adjective': 'adjective',
    'Adverb': 'adverb',
    'Pronoun': 'pronoun',
    'Preposition': 'preposition',
    'Conjunction': 'conjunction',
    'Particle': 'particle',
    'Interjection': 'interjection',
    'Interrogative': 'question',
    'Phrase': 'phrase',
  };
  return typeMap[type] || 'noun'; // Default to noun if unknown
}

// Map Duolingo gender to our schema
function mapGender(gender) {
  if (!gender || gender === '') return null;
  const genderMap = {
    'Masculine': 'masculine',
    'Feminine': 'feminine',
    'M': 'masculine',
    'F': 'feminine',
  };
  return genderMap[gender] || null;
}

// Map Duolingo number to our schema
function mapNumber(number) {
  if (!number || number === '') return null;
  const numberMap = {
    'Singular': 'singular',
    'Plural': 'plural',
    'Dual': 'dual',
    'S': 'singular',
    'P': 'plural',
  };
  return numberMap[number] || null;
}

// Calculate difficulty level from tags (01. = level 1, etc.)
function calculateDifficulty(entry) {
  const categories = entry.categories || [];
  for (const cat of categories) {
    const match = cat.match(/^(\d+)\./);
    if (match) {
      const level = parseInt(match[1]);
      // Map Duolingo levels 1-78 to our scale 1-10
      return Math.min(Math.ceil(level / 8), 10);
    }
  }
  return 5; // Default medium difficulty
}

// Calculate frequency rank from card statistics
function calculateFrequencyRank(entry) {
  if (!entry.source || !entry.source.cards || !entry.source.cards.length) {
    return null;
  }
  
  // Use card statistics as a proxy for frequency
  // Cards with more repetitions are more common
  const card = entry.source.cards[0];
  const repetitions = card.repetitions || 0;
  const interval = card.interval || 0;
  
  // Simple ranking: more repetitions + longer intervals = higher frequency
  const score = repetitions * 10 + interval;
  return score > 0 ? score : null;
}

// Extract audio path from Anki [sound:...] format
function extractAudioPath(audioField) {
  if (!audioField) return null;
  const match = audioField.match(/\[sound:([^\]]+)\]/);
  if (match && match[1]) {
    // The actual audio path is in entry.audio array
    return null; // We'll use entry.audio instead
  }
  return null;
}

async function migrateDuolingo() {
  console.log('📚 Starting Duolingo vocabulary migration...\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be written\n');
  }
  
  if (limit) {
    console.log(`⚠️  Limiting to first ${limit} words\n`);
  }
  
  // Load vocabulary.json
  const vocabPath = join(__dirname, '..', 'public', 'hebrew_duolingo_app_bundle', 'vocabulary.json');
  const vocabData = JSON.parse(await readFile(vocabPath, 'utf-8'));
  
  const entries = vocabData.entries || [];
  const totalCount = limit ? Math.min(limit, entries.length) : entries.length;
  
  console.log(`Found ${entries.length} entries in vocabulary.json`);
  console.log(`Processing ${totalCount} entries\n`);
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let audioAdded = 0;
  
  for (let i = 0; i < totalCount; i++) {
    const entry = entries[i];
    
    if (i % 100 === 0 && i > 0) {
      console.log(`Progress: ${i}/${totalCount} (${Math.round(i/totalCount*100)}%)`);
    }
    
    try {
      const fields = entry.source?.original_fields || {};
      const hebrew = entry.hebrew || fields.Hebrew;
      const niqqud = entry.niqqud || fields.Niqqud;
      
      if (!hebrew) {
        console.warn(`⚠️  Skipping entry ${entry.id} - no Hebrew text`);
        skipped++;
        continue;
      }
      
      const wordKey = generateWordKey(hebrew);
      
      // Skip if key is empty or invalid
      if (!wordKey || wordKey.length < 1) {
        console.warn(`⚠️  Skipping entry ${entry.id} - invalid word key`);
        skipped++;
        continue;
      }
      
      // Get first translation (entries can have multiple)
      const translations = entry.translations || [fields.Translation];
      const primaryTranslation = translations[0] || fields.Translation || hebrew;
      
      // Map data to vocabulary_words schema
      const vocabWord = {
        word_key: wordKey,
        hebrew: hebrew,
        niqqud: niqqud || hebrew,
        transliteration: entry.transliteration || fields.Transliteration || null,
        en: primaryTranslation,
        fr: primaryTranslation, // Will be translated later
        es: primaryTranslation, // Will be translated later
        part_of_speech: mapPartOfSpeech(entry.grammar?.part_of_speech || fields.Type),
        gender: mapGender(entry.grammar?.gender || fields.Gender),
        number: mapNumber(entry.grammar?.number || fields.Number),
        difficulty_level: calculateDifficulty(entry),
        frequency_rank: calculateFrequencyRank(entry),
        tags: entry.categories || [],
        notes: entry.enrichment?.notes || null,
      };
      
      if (dryRun) {
        // In dry run, just log what would be inserted
        if (i < 10) { // Show first 10
          console.log(`Would insert: ${wordKey} (${hebrew}) - ${primaryTranslation}`);
        }
        inserted++;
        continue;
      }
      
      // Upsert word
      const { data: wordData, error: wordError } = await supabase
        .from('vocabulary_words')
        .upsert(vocabWord, {
          onConflict: 'word_key',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (wordError) {
        console.error(`❌ Error with word "${wordKey}":`, wordError.message);
        errors++;
        continue;
      }
      
      if (!wordData) {
        console.warn(`⚠️  No data returned for "${wordKey}"`);
        skipped++;
        continue;
      }
      
      inserted++;
      
      // Handle audio if present
      if (entry.audio && entry.audio.length > 0) {
        const audioPath = entry.audio[0].path;
        if (audioPath) {
          const { error: mediaError } = await supabase
            .from('word_media')
            .upsert({
              word_id: wordData.id,
              media_type: 'audio',
              media_url: audioPath,
              audio_quality: 'native',
              speaker: 'default',
              is_default: true
            }, {
              onConflict: 'word_id,media_url',
              ignoreDuplicates: true
            });
          
          if (!mediaError) {
            audioAdded++;
          }
        }
      }
      
    } catch (err) {
      console.error(`❌ Unexpected error with entry ${entry.id}:`, err.message);
      errors++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Total processed: ${totalCount}`);
  console.log(`   Inserted/Updated: ${inserted}`);
  console.log(`   Audio files added: ${audioAdded}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  
  if (dryRun) {
    console.log('\n✅ Dry run completed - no data was written');
  } else if (errors === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log(`\n⚠️  Migration completed with ${errors} error(s)`);
    process.exit(1);
  }
}

// Run migration
migrateDuolingo().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
