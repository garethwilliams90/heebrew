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
  // Section 1: Introduction to letters (Levels 1-2)
  // Note: Level 0L is the landing page that opens Level 1
  {
    section_id: 1,
    level_id: 1,
    section_order: 1,
    level_order: 1,
    title_en: 'Level 1 - First Three Letters',
    description_en: 'Letters א, ב, ג with nikud and four sound exercises',
    difficulty_level: 1,
    is_exam: false,
    unlock_requirements: {}
  },
  {
    section_id: 1,
    level_id: 2,
    section_order: 2,
    level_order: 2,
    title_en: 'Level 2 - First Five Letters',
    description_en: 'Letters א through ה with nikud and speaking practice',
    difficulty_level: 1,
    is_exam: false,
    unlock_requirements: { requires_level: 1 }
  },
  
  // Section 2: Learning the aleph-bet (Levels 3-11)
  { section_id: 2, level_id: 3, section_order: 1, level_order: 3, title_en: 'Level 3 - Letters ו & ז', description_en: 'Learn letters vav and zayin', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 2 } },
  { section_id: 2, level_id: 4, section_order: 2, level_order: 4, title_en: 'Level 4 - Letters ח & ט', description_en: 'Learn letters chet and tet', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 3 } },
  { section_id: 2, level_id: 5, section_order: 3, level_order: 5, title_en: 'Level 5 - Letters י & כ', description_en: 'Learn letters yod and kaf', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 4 } },
  { section_id: 2, level_id: 6, section_order: 4, level_order: 6, title_en: 'Level 6 - Letters ל & מ', description_en: 'Learn letters lamed and mem', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 5 } },
  { section_id: 2, level_id: 7, section_order: 5, level_order: 7, title_en: 'Level 7 - Letters נ & ס', description_en: 'Learn letters nun and samekh', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 6 } },
  { section_id: 2, level_id: 8, section_order: 6, level_order: 8, title_en: 'Level 8 - Letters ע & פ', description_en: 'Learn letters ayin and pe', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 7 } },
  { section_id: 2, level_id: 9, section_order: 7, level_order: 9, title_en: 'Level 9 - Letters צ & ק', description_en: 'Learn letters tsadi and qof', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 8 } },
  { section_id: 2, level_id: 10, section_order: 8, level_order: 10, title_en: 'Level 10 - Letters ר & ש', description_en: 'Learn letters resh and shin', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 9 } },
  { section_id: 2, level_id: 11, section_order: 9, level_order: 11, title_en: 'Level 11 - Letter ת', description_en: 'Learn letter tav - complete the aleph-bet', difficulty_level: 2, is_exam: false, unlock_requirements: { requires_level: 10 } },
  
  // Section 3: Words, sentences and basic grammar (Level 12)
  { section_id: 3, level_id: 12, section_order: 1, level_order: 12, title_en: 'Level 12 - First Words Without Nikud', description_en: 'Start reading real Hebrew words - 50 three-letter words', difficulty_level: 3, is_exam: false, unlock_requirements: { requires_level: 11 } },
  
  // Section 3 continued: Possession (Level 13)
  {
    section_id: 3,
    level_id: 13,
    section_order: 2,
    level_order: 13,
    title_en: 'Level 13 - Possession (של)',
    description_en: 'Learn possession: שלי, שלך, שלו, שלה, שלנו, שלכם, שלכן, שלהם, שלהן',
    difficulty_level: 3,
    is_exam: false,
    unlock_requirements: { requires_level: 12 }
  },
  
  // Section 4: Verbs - Present Tense (Levels 14-40+)
  { section_id: 4, level_id: 14, section_order: 1, level_order: 14, title_en: 'Level 14 - Present Tense Verbs (את)', description_en: 'Verbs לאכול, לשתות, ללמוד with את', difficulty_level: 4, is_exam: false, unlock_requirements: { requires_level: 13 } },
  { section_id: 4, level_id: 15, section_order: 2, level_order: 15, title_en: 'Level 15 - Reading Verb', description_en: 'Verb לקרוא with עיתון, מכתב, סיפור', difficulty_level: 4, is_exam: false, unlock_requirements: { requires_level: 14 } },
  { section_id: 4, level_id: 16, section_order: 3, level_order: 16, title_en: 'Level 16 - Writing & Loving', description_en: 'Verbs לכתוב, לאהוב with שיר, מוזיקה', difficulty_level: 4, is_exam: false, unlock_requirements: { requires_level: 15 } },
  { section_id: 4, level_id: 17, section_order: 4, level_order: 17, title_en: 'Level 17 - More את Verbs', description_en: 'Complete the את verb block', difficulty_level: 4, is_exam: false, unlock_requirements: { requires_level: 16 } },
  { section_id: 4, level_id: 18, section_order: 5, level_order: 18, title_en: 'Level 18 - Verbs with ל', description_en: 'Present-tense verbs that take ל (לפארק, לילד)', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 17 } },
  { section_id: 4, level_id: 19, section_order: 6, level_order: 19, title_en: 'Level 19 - More ל Verbs', description_en: 'Continue with ל verbs', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 18 } },
  { section_id: 4, level_id: 20, section_order: 7, level_order: 20, title_en: 'Level 20 - ל Verbs Practice', description_en: 'Practice ל verbs', difficulty_level: 5, is_exam: false, unlock_requirements: { requires_level: 19 } },
  { section_id: 4, level_id: 21, section_order: 8, level_order: 21, title_en: 'Exam - Levels 14-20', description_en: 'First verb exam (3 lives)', difficulty_level: 5, is_exam: true, unlock_requirements: { requires_level: 20 } },
  
  // Levels 22-29: Complex sentences with connectors
  { section_id: 4, level_id: 22, section_order: 9, level_order: 22, title_en: 'Level 22 - Connectors Begin', description_en: 'First connectors: ו, אבל, או', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 21 } },
  { section_id: 4, level_id: 23, section_order: 10, level_order: 23, title_en: 'Level 23 - More Connectors', description_en: 'Connectors: כי, אז, גם', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 22 } },
  { section_id: 4, level_id: 24, section_order: 11, level_order: 24, title_en: 'Level 24 - Complex Sentences', description_en: 'Connectors: רק, אלא, לכן', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 23 } },
  { section_id: 4, level_id: 25, section_order: 12, level_order: 25, title_en: 'Level 25 - Building Complexity', description_en: 'Connectors: בעצם, כש, לפני ש', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 24 } },
  { section_id: 4, level_id: 26, section_order: 13, level_order: 26, title_en: 'Level 26 - Time Relations', description_en: 'Connectors: אחרי ש, בזמן ש, עד ש', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 25 } },
  { section_id: 4, level_id: 27, section_order: 14, level_order: 27, title_en: 'Level 27 - Advanced Connectors', description_en: 'Connectors: מאז ש, ואז, קודם כול', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 26 } },
  { section_id: 4, level_id: 28, section_order: 15, level_order: 28, title_en: 'Level 28 - Sentence Flow', description_en: 'Connectors: בסוף, בינתיים, למשל', difficulty_level: 6, is_exam: false, unlock_requirements: { requires_level: 27 } },
  { section_id: 4, level_id: 29, section_order: 16, level_order: 29, title_en: 'Exam - Connectors', description_en: 'Exam covering connectors learned so far', difficulty_level: 6, is_exam: true, unlock_requirements: { requires_level: 28 } },
  
  // Level 30: Past tense introduction
  { section_id: 4, level_id: 30, section_order: 17, level_order: 30, title_en: 'Level 30 - Past Tense', description_en: 'Past tense with אתמול - verbs you already know', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 29 } },
  
  // Levels 31-37: Past tense + more connectors
  { section_id: 4, level_id: 31, section_order: 18, level_order: 31, title_en: 'Level 31 - Past & Present', description_en: 'Practice past and present with new connectors', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 30 } },
  { section_id: 4, level_id: 32, section_order: 19, level_order: 32, title_en: 'Level 32 - More Past Practice', description_en: 'Continue past tense with new nouns', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 31 } },
  { section_id: 4, level_id: 33, section_order: 20, level_order: 33, title_en: 'Level 33 - Advanced Connectors', description_en: 'Connectors: כלומר, זאת אומרת, במיוחד', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 32 } },
  { section_id: 4, level_id: 34, section_order: 21, level_order: 34, title_en: 'Level 34 - Building Fluency', description_en: 'More connectors: בנוסף, חוץ מ, גם...וגם', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 33 } },
  { section_id: 4, level_id: 35, section_order: 22, level_order: 35, title_en: 'Level 35 - Complex Expressions', description_en: 'Connectors: לא רק...אלא גם, למרות ש', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 34 } },
  { section_id: 4, level_id: 36, section_order: 23, level_order: 36, title_en: 'Level 36 - Contrasts', description_en: 'Connectors: למרות זאת, מצד אחד...מצד שני', difficulty_level: 7, is_exam: false, unlock_requirements: { requires_level: 35 } },
  { section_id: 4, level_id: 37, section_order: 24, level_order: 37, title_en: 'Exam - Past Tense', description_en: 'Exam covering past tense and all connectors', difficulty_level: 7, is_exam: true, unlock_requirements: { requires_level: 36 } },
  
  // Levels 38-40: Final connectors and future tense
  { section_id: 4, level_id: 38, section_order: 25, level_order: 38, title_en: 'Level 38 - Conditionals', description_en: 'Connectors: אם, אם...אז, אחרת, אפילו אם', difficulty_level: 8, is_exam: false, unlock_requirements: { requires_level: 37 } },
  { section_id: 4, level_id: 39, section_order: 26, level_order: 39, title_en: 'Level 39 - Cause & Effect', description_en: 'Connectors: בגלל ש, בגלל זה, כתוצאה מכך, במקום ש', difficulty_level: 8, is_exam: false, unlock_requirements: { requires_level: 38 } },
  { section_id: 4, level_id: 40, section_order: 27, level_order: 40, title_en: 'Level 40 - Future Tense', description_en: 'Future tense with מחר plus כדי ש - all three tenses', difficulty_level: 8, is_exam: false, unlock_requirements: { requires_level: 39 } },
  
  // Section 5: Existential Concepts (opens after Hebrew 101 exam)
  // Note: These come after the main Hebrew 101 curriculum
  {
    section_id: 5,
    level_id: 101,
    section_order: 1,
    level_order: 101,
    title_en: 'יש & אין - There is/There isn\'t',
    description_en: 'Existential concepts: יש (there is), אין (there isn\'t), יש לי (I have)',
    difficulty_level: 3,
    is_exam: false,
    unlock_requirements: { requires_level: 40 }
  },
  {
    section_id: 5,
    level_id: 102,
    section_order: 2,
    level_order: 102,
    title_en: 'Age & Numbers',
    description_en: 'State and ask about age: בן/בת + numbers, בן כמה/בת כמה',
    difficulty_level: 3,
    is_exam: false,
    unlock_requirements: { requires_level: 101 }
  },
  {
    section_id: 5,
    level_id: 103,
    section_order: 3,
    level_order: 103,
    title_en: 'Coffee Shop Interaction',
    description_en: 'Full conversation: ordering coffee, customer and waiter phrases',
    difficulty_level: 3,
    is_exam: false,
    unlock_requirements: { requires_level: 102 }
  },
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
    
    const sectionNames = {
      1: 'Introduction to Letters',
      2: 'Learning the Aleph-Bet',
      3: 'Words, Sentences & Basic Grammar',
      4: 'Verbs: Present Tense & Beyond',
      5: 'Existential Concepts'
    };
    
    sections.forEach((lessons, sectionId) => {
      const examCount = lessons.filter(l => l.is_exam).length;
      const teachingCount = lessons.length - examCount;
      console.log(`   Section ${sectionId} (${sectionNames[sectionId]}): ${lessons.length} lessons (${teachingCount} teaching, ${examCount} exams)`);
    });
    
    console.log('\n🎯 Exam Levels: 21, 29, 37 (every 8th level from level 14)');
    console.log('\n📖 Total curriculum: Levels 1-40 (Hebrew 101) + Levels 101-103 (Section 3)');
    
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
