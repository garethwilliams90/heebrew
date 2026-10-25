#!/usr/bin/env node

/**
 * Seed Lessons Table
 * 
 * Populates the lessons table with the existing curriculum structure
 * from LearningFlow.md. This creates lesson records without vocabulary
 * or sentence associations (those come in later steps).
 * 
 * Run from my-app directory:
 *   node scripts/seed-lessons.mjs
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

// Curriculum structure from LearningFlow.md
// Note: level_id is globally unique across all sections
const lessons = [
  // Section 1: Introduction to letters (Levels 0-2)
  {
    section_id: 1,
    level_id: 0,
    section_order: 1,
    level_order: 0,
    title_en: 'Introduction - First Letters',
    description_en: 'Learn א, ב, ג with nikud practice and four sound exercises',
    difficulty_level: 1,
    is_exam: false,
    unlock_requirements: {}
  },
  {
    section_id: 1,
    level_id: 1,
    section_order: 2,
    level_order: 1,
    title_en: 'Level 1 - First Three Letters',
    description_en: 'Letters א, ב, ג with nikud and speaking exercises',
    difficulty_level: 1,
    is_exam: false,
    unlock_requirements: { requires_level: 0 }
  },
  {
    section_id: 1,
    level_id: 2,
    section_order: 3,
    level_order: 2,
    title_en: 'Level 2 - First Five Letters',
    description_en: 'Letters א through ה with nikud and speaking practice',
    difficulty_level: 1,
    is_exam: false,
    unlock_requirements: { requires_level: 1 }
  },
  
  // Section 2: Learning the aleph-bet (Levels 3-12)
  { section_id: 2, level_id: 3, section_order: 1, level_order: 3, title_en: 'Level 3 - Letters ו & ז', description_en: 'Learn letters vav and zayin', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 2 } },
  { section_id: 2, level_id: 4, section_order: 2, level_order: 4, title_en: 'Level 4 - Letters ח & ט', description_en: 'Learn letters chet and tet', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 3 } },
  { section_id: 2, level_id: 5, section_order: 3, level_order: 5, title_en: 'Level 5 - Letters י & כ', description_en: 'Learn letters yod and kaf', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 4 } },
  { section_id: 2, level_id: 6, section_order: 4, level_order: 6, title_en: 'Level 6 - Letters ל & מ', description_en: 'Learn letters lamed and mem', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 5 } },
  { section_id: 2, level_id: 7, section_order: 5, level_order: 7, title_en: 'Level 7 - Letters נ & ס', description_en: 'Learn letters nun and samekh', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 6 } },
  { section_id: 2, level_id: 8, section_order: 6, level_order: 8, title_en: 'Level 8 - Letters ע & פ', description_en: 'Learn letters ayin and pe', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 7 } },
  { section_id: 2, level_id: 9, section_order: 7, level_order: 9, title_en: 'Level 9 - Letters צ & ק', description_en: 'Learn letters tsadi and qof', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 8 } },
  { section_id: 2, level_id: 10, section_order: 8, level_order: 10, title_en: 'Level 10 - Letters ר & ש', description_en: 'Learn letters resh and shin', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 9 } },
  { section_id: 2, level_id: 11, section_order: 9, level_order: 11, title_en: 'Level 11 - Letter ת', description_en: 'Learn letter tav - complete the aleph-bet', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 10 } },
  { section_id: 2, level_id: 12, section_order: 10, level_order: 12, title_en: 'Level 12 - First Words Without Nikud', description_en: 'Start reading real Hebrew words - 50 three-letter words', difficulty_level: 3, is_exam: false, unlock_requirements: { requires_level: 11 } },
  
  // Section 3: Words, sentences and basic grammar (Levels 13+)
  {
    section_id: 3,
    level_id: 13,
    section_order: 1,
    level_order: 13,
    title_en: 'Level 13 - Possession (של)',
    description_en: 'Learn possession with של: שלי, שלך, שלו, שלה, שלנו, שלכם, שלכן',
    difficulty_level: 3,
    is_exam: false,
    unlock_requirements: { requires_level: 12 }
  },
  {
    section_id: 3,
    level_id: 14,
    section_order: 2,
    level_order: 14,
    title_en: 'Level 14 - Present Tense Verbs (את)',
    description_en: 'Present tense verbs: אוכל, שותה, לומד with את',
    difficulty_level: 4,
    is_exam: false,
    unlock_requirements: { requires_level: 13 }
  },
  {
    section_id: 3,
    level_id: 15,
    section_order: 3,
    level_order: 15,
    title_en: 'Level 15 - Reading Verb',
    description_en: 'Verb לקרוא (to read) with newspaper, letter, story',
    difficulty_level: 4,
    is_exam: false,
    unlock_requirements: { requires_level: 14 }
  },
  {
    section_id: 3,
    level_id: 16,
    section_order: 4,
    level_order: 16,
    title_en: 'Level 16 - Writing & Loving',
    description_en: 'Verbs לכתוב (to write) and לאהוב (to love) with song and music',
    difficulty_level: 4,
    is_exam: false,
    unlock_requirements: { requires_level: 15 }
  },
  
  // Additional levels (17-21) from curriculum
  { section_id: 3, level_id: 17, section_order: 5, level_order: 17, title_en: 'Level 17 - More את Verbs', description_en: 'Continue with present-tense verbs that take את', difficulty_level: 4, is_exam: false, unlock_requirements: { requires_level: 16 } },
  { section_id: 3, level_id: 18, section_order: 6, level_order: 18, title_en: 'Level 18 - Verbs with ל', description_en: 'Present-tense verbs that take ל', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 17 } },
  { section_id: 3, level_id: 19, section_order: 7, level_order: 19, title_en: 'Level 19 - More ל Verbs', description_en: 'Continue with ל verbs', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 18 } },
  { section_id: 3, level_id: 20, section_order: 8, level_order: 20, title_en: 'Level 20 - ל Verbs Practice', description_en: 'Practice ל verbs', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 19 } },
  { section_id: 3, level_id: 21, section_order: 9, level_order: 21, title_en: 'Exam - Levels 14-20', description_en: 'Exam covering verbs learned so far', difficulty_level: 5, is_exam: true, unlock_requirements: { requires_level: 20 } },
];

async function seedLessons() {
  console.log('🌱 Seeding lessons table...\n');
  console.log('=' .repeat(60));
  
  let inserted = 0;
  let errors = 0;
  
  for (const lesson of lessons) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .upsert(lesson, {
          onConflict: 'section_id,level_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error with lesson ${lesson.level_id}:`, error.message);
        errors++;
        continue;
      }
      
      if (data) {
        inserted++;
        console.log(`✓ Section ${lesson.section_id}, Level ${lesson.level_id}: ${lesson.title_en}`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error with lesson ${lesson.level_id}:`, err);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Seeding Summary:');
  console.log(`   Inserted/Updated: ${inserted}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${lessons.length}`);
  
  if (errors === 0) {
    console.log('\n✅ Lessons seeded successfully!');
    
    // Show breakdown by section
    console.log('\n📚 Lessons by Section:');
    const sections = new Map();
    lessons.forEach(l => {
      if (!sections.has(l.section_id)) sections.set(l.section_id, []);
      sections.get(l.section_id).push(l);
    });
    
    sections.forEach((lessons, sectionId) => {
      console.log(`   Section ${sectionId}: ${lessons.length} lessons`);
    });
    
  } else {
    console.log(`\n⚠️  Seeding completed with ${errors} error(s)`);
    process.exit(1);
  }
}

// Run seeding
seedLessons().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
