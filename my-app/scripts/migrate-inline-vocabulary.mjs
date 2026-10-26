#!/usr/bin/env node

/**
 * Phase 2 Data Migration: Extract inline vocabulary from TypeScript level files
 * 
 * This script parses existing level files (level-thirteen.ts, etc.) and extracts
 * the inline vocabulary definitions, then inserts them into Supabase.
 * 
 * This handles the levels that currently use word() and sentence() helpers
 * instead of loading from external data files.
 * 
 * Run from my-app directory:
 *   node scripts/migrate-inline-vocabulary.mjs [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line args
const dryRun = process.argv.includes('--dry-run');

// Load Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Level files to process
const levelFiles = [
  { file: 'level-thirteen.ts', section: 3, level: 13, name: 'Possession (shel)' },
  { file: 'level-fourteen.ts', section: 3, level: 14, name: 'Present tense verbs (eat, drink, learn)' },
  { file: 'level-fifteen.ts', section: 3, level: 15, name: 'Reading verbs and nouns' },
  { file: 'level-sixteen.ts', section: 3, level: 16, name: 'Writing and loving' },
];

// Simple regex-based parser for word() calls
// Format: word("hebrew", "english", "french", "spanish", "audio?")
function parseWordCalls(content) {
  const wordRegex = /word\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/g;
  const words = [];
  
  let match;
  while ((match = wordRegex.exec(content)) !== null) {
    const [, hebrew, en, fr, es, audio] = match;
    words.push({
      hebrew,
      en,
      fr,
      es,
      audio: audio || null
    });
  }
  
  return words;
}

// Extract variable names and their word definitions
function extractWordDefinitions(content) {
  const lines = content.split('\n');
  const definitions = new Map();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match: const varName = word(...)
    const match = line.match(/^const\s+(\w+)\s*=\s*word\(/);
    if (match) {
      const varName = match[1];
      // Try to extract the full word() call (might span multiple lines)
      let fullMatch = line.match(/word\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/);
      
      if (fullMatch) {
        const [, hebrew, en, fr, es, audio] = fullMatch;
        definitions.set(varName, {
          id: varName,
          hebrew,
          en,
          fr,
          es,
          audio: audio || null
        });
      }
    }
  }
  
  return definitions;
}

// Infer part of speech from variable name and context
function inferPartOfSpeech(varName, hebrew, en) {
  // Common patterns
  if (varName.match(/^(ochel|shote|lomed|kore|kotev|ohev)/)) return 'verb';
  if (varName.match(/^(ani|ata|at|hu|hi|anachnu|atem|aten|hem|hen)/)) return 'pronoun';
  if (varName.match(/^(et|ha|shel)/)) return 'particle';
  if (varName.match(/^(ze|ele)/)) return 'pronoun';
  
  // Check English for hints
  const enLower = en.toLowerCase();
  if (enLower === 'the' || enLower === 'and' || enLower === 'or') return 'particle';
  if (enLower === 'i' || enLower === 'you' || enLower === 'he' || enLower === 'she') return 'pronoun';
  
  // Default to noun
  return 'noun';
}

// Generate word key from Hebrew (normalize, lowercase)
function generateWordKey(hebrew, varName) {
  // Use variable name if Hebrew is short (might be particle)
  if (hebrew.length <= 2) {
    return varName.toLowerCase();
  }
  
  // Remove niqqud and normalize
  const normalized = hebrew.replace(/[\u0591-\u05C7]/g, '').trim();
  return normalized.toLowerCase().replace(/\s+/g, '-');
}

async function processLevelFile(fileInfo) {
  const filePath = join(__dirname, '..', 'lib', 'learn', fileInfo.file);
  
  console.log(`\n📄 Processing ${fileInfo.file}...`);
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const wordDefs = extractWordDefinitions(content);
    
    console.log(`   Found ${wordDefs.size} word definitions`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (const [varName, wordData] of wordDefs.entries()) {
      const wordKey = generateWordKey(wordData.hebrew, varName);
      const partOfSpeech = inferPartOfSpeech(varName, wordData.hebrew, wordData.en);
      
      const vocabWord = {
        word_key: wordKey,
        hebrew: wordData.hebrew,
        niqqud: wordData.hebrew, // Inline defs don't separate niqqud
        transliteration: null,
        en: wordData.en,
        fr: wordData.fr,
        es: wordData.es,
        part_of_speech: partOfSpeech,
        gender: null, // Would need more parsing
        difficulty_level: Math.min(Math.ceil(fileInfo.level / 2), 10),
        tags: [`level-${fileInfo.level}`, 'inline-extracted'],
        default_audio_url: wordData.audio
      };
      
      if (dryRun) {
        console.log(`   Would insert: ${wordKey} (${wordData.hebrew}) - ${wordData.en}`);
        inserted++;
        continue;
      }
      
      // Check if word already exists
      const { data: existing } = await supabase
        .from('vocabulary_words')
        .select('id')
        .eq('word_key', wordKey)
        .single();
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Insert new word
      const { data: newWord, error } = await supabase
        .from('vocabulary_words')
        .insert(vocabWord)
        .select()
        .single();
      
      if (error) {
        console.error(`   ❌ Error inserting ${wordKey}:`, error.message);
        continue;
      }
      
      inserted++;
      
      // Add audio if present
      if (wordData.audio && newWord) {
        await supabase
          .from('word_media')
          .insert({
            word_id: newWord.id,
            media_type: 'audio',
            media_url: wordData.audio,
            audio_quality: 'native',
            is_default: true
          });
      }
    }
    
    console.log(`   ✓ Inserted: ${inserted}, Skipped (already exists): ${skipped}`);
    
  } catch (err) {
    console.error(`   ❌ Error processing ${fileInfo.file}:`, err.message);
  }
}

async function migrateInlineVocabulary() {
  console.log('📚 Extracting inline vocabulary from level files...\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be written\n');
  }
  
  for (const fileInfo of levelFiles) {
    await processLevelFile(fileInfo);
  }
  
  console.log('\n✅ Inline vocabulary extraction complete!');
  console.log('\nNote: This script extracts word() definitions but not sentence() definitions.');
  console.log('Sentences will be migrated separately in Phase 3 (lesson content migration).');
}

// Run migration
migrateInlineVocabulary().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
