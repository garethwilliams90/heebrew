#!/usr/bin/env node

/**
 * Phase 1 Data Migration: Load catalog.json into Supabase
 * 
 * This script migrates the 40 curated words from lib/learn/words/catalog.json
 * into the new vocabulary_words table in Supabase.
 * 
 * Run from my-app directory:
 *   node scripts/migrate-catalog-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCatalog() {
  console.log('📚 Starting catalog.json migration...\n');
  
  // Load catalog.json
  const catalogPath = join(__dirname, '..', 'lib', 'learn', 'words', 'catalog.json');
  const catalogData = JSON.parse(await readFile(catalogPath, 'utf-8'));
  
  console.log(`Found ${catalogData.length} words in catalog.json\n`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  for (const word of catalogData) {
    try {
      // Map catalog format to vocabulary_words schema
      const vocabWord = {
        word_key: word.id,
        hebrew: word.hebrew,
        niqqud: word.niqqud || word.hebrew,
        transliteration: word.transliteration || word.reading || null,
        en: word.en,
        fr: word.fr || word.en,
        es: word.es || word.en,
        part_of_speech: word.partOfSpeech,
        gender: word.gender || null,
        difficulty_level: 1, // Section 2 fundamentals = basic
        tags: ['section-2', 'fundamentals', 'catalog'],
        default_audio_url: word.audio || null
      };
      
      // Upsert (insert or update if word_key already exists)
      const { data, error } = await supabase
        .from('vocabulary_words')
        .upsert(vocabWord, {
          onConflict: 'word_key',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error with word "${word.id}":`, error.message);
        errors++;
        continue;
      }
      
      if (data) {
        // Check if this was an insert or update
        // (Supabase doesn't tell us directly, so we'll count all as inserts for simplicity)
        inserted++;
        
        // If there's audio, create word_media entry
        if (word.audio) {
          // Check if media already exists
          const { data: existingMedia } = await supabase
            .from('word_media')
            .select('id')
            .eq('word_id', data.id)
            .eq('media_url', word.audio)
            .single();
          
          if (!existingMedia) {
            const { error: mediaError } = await supabase
              .from('word_media')
              .insert({
                word_id: data.id,
                media_type: 'audio',
                media_url: word.audio,
                audio_quality: 'native',
                speaker: 'default',
                is_default: true
              });
            
            if (mediaError) {
              console.warn(`⚠️  Could not add audio for "${word.id}": ${mediaError.message}`);
            }
          }
        }
        
        console.log(`✓ ${word.id} (${word.en})`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error with word "${word.id}":`, err);
      errors++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Inserted/Updated: ${inserted}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${catalogData.length}`);
  
  if (errors === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log(`\n⚠️  Migration completed with ${errors} error(s)`);
    process.exit(1);
  }
}

// Run migration
migrateCatalog().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
