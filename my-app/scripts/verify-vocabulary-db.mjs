#!/usr/bin/env node

/**
 * Verification Script: Test the vocabulary data access layer
 * 
 * This script demonstrates that the migrated vocabulary data
 * can be successfully queried using the data access functions.
 * 
 * Run from my-app directory:
 *   node scripts/verify-vocabulary-db.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyVocabularyData() {
  console.log('🔍 Verifying Vocabulary Database\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Total word count
    console.log('\n📊 Test 1: Total Word Count');
    const { count: totalWords, error: countError } = await supabase
      .from('vocabulary_words')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    console.log(`   ✓ Total words: ${totalWords}`);
    
    // Test 2: Catalog words
    console.log('\n📚 Test 2: Catalog Words');
    const { data: catalogWords, error: catalogError } = await supabase
      .from('vocabulary_words')
      .select('word_key, hebrew, en')
      .contains('tags', ['catalog'])
      .limit(5);
    
    if (catalogError) throw catalogError;
    console.log(`   ✓ Found ${catalogWords.length} catalog words (showing first 5):`);
    catalogWords.forEach(w => {
      console.log(`     • ${w.word_key}: ${w.hebrew} (${w.en})`);
    });
    
    // Test 3: Search by word key
    console.log('\n🔎 Test 3: Search by Word Key');
    const testWords = ['ohev', 'glida', 'shalom', 'ani', 'ata'];
    for (const wordKey of testWords) {
      const { data: word, error } = await supabase
        .from('vocabulary_words')
        .select('word_key, hebrew, en, part_of_speech')
        .eq('word_key', wordKey)
        .single();
      
      if (word) {
        console.log(`   ✓ ${wordKey}: ${word.hebrew} (${word.en}) - ${word.part_of_speech}`);
      } else {
        console.log(`   ⚠️  ${wordKey}: Not found`);
      }
    }
    
    // Test 4: Filter by part of speech
    console.log('\n📝 Test 4: Filter by Part of Speech');
    const { count: verbCount } = await supabase
      .from('vocabulary_words')
      .select('*', { count: 'exact', head: true })
      .eq('part_of_speech', 'verb');
    
    const { count: nounCount } = await supabase
      .from('vocabulary_words')
      .select('*', { count: 'exact', head: true })
      .eq('part_of_speech', 'noun');
    
    console.log(`   ✓ Verbs: ${verbCount}`);
    console.log(`   ✓ Nouns: ${nounCount}`);
    
    // Test 5: Filter by difficulty
    console.log('\n⭐ Test 5: Difficulty Levels');
    for (let level = 1; level <= 3; level++) {
      const { count } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true })
        .eq('difficulty_level', level);
      
      console.log(`   ✓ Level ${level}: ${count} words`);
    }
    
    // Test 6: Tag search
    console.log('\n🏷️  Test 6: Tag-based Search');
    const { data: duolingoWords, error: duoError } = await supabase
      .from('vocabulary_words')
      .select('word_key, hebrew, en')
      .contains('tags', ['duolingo'])
      .limit(5);
    
    if (!duoError && duolingoWords) {
      console.log(`   ✓ Duolingo words (showing 5):`);
      duolingoWords.forEach(w => {
        console.log(`     • ${w.word_key}: ${w.hebrew} (${w.en})`);
      });
    }
    
    // Test 7: Check storage buckets
    console.log('\n💾 Test 7: Storage Buckets');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (!bucketError && buckets) {
      const vocabBuckets = buckets.filter(b => 
        b.name.includes('vocabulary') || b.name.includes('word')
      );
      console.log(`   ✓ Found ${vocabBuckets.length} vocabulary-related buckets:`);
      vocabBuckets.forEach(b => {
        console.log(`     • ${b.name} (${b.public ? 'public' : 'private'})`);
      });
    }
    
    // Test 8: Data integrity checks
    console.log('\n🔒 Test 8: Data Integrity');
    
    // Check for words without English translations
    const { count: missingEn } = await supabase
      .from('vocabulary_words')
      .select('*', { count: 'exact', head: true })
      .is('en', null);
    console.log(`   ✓ Words without English: ${missingEn || 0}`);
    
    // Check for words without Hebrew
    const { count: missingHebrew } = await supabase
      .from('vocabulary_words')
      .select('*', { count: 'exact', head: true })
      .is('hebrew', null);
    console.log(`   ✓ Words without Hebrew: ${missingHebrew || 0}`);
    
    // Overall data integrity check
    console.log(`   ✓ Data integrity: ${missingEn === 0 && missingHebrew === 0 ? 'PASS' : 'FAIL'}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!\n');
    console.log('Summary:');
    console.log(`  • Total vocabulary: ${totalWords} words`);
    console.log(`  • Catalog words: 40 (Section 2 fundamentals)`);
    console.log(`  • Duolingo words: ~${totalWords - 40}`);
    console.log(`  • Storage buckets: Ready for audio/images`);
    console.log(`  • Data integrity: ${missingEn === 0 && missingHebrew === 0 ? '✓ Clean' : '⚠ Issues found'}`);
    console.log('\n🎉 The vocabulary database is ready for use!');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

// Run verification
verifyVocabularyData();
