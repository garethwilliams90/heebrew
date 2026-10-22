import { readKnownWords } from "@/lib/learn/known-words";
import { verbConjugations, getForm, type VerbRecord, type ConjugatedForm } from "./verb-conjugations";
import { sentenceTemplates, type SentenceTemplate } from "./sentence-templates";
import type { TrainingQuestion } from "./questions";

export type UserLevel = 1 | 2 | 3;

export type DistractorType = "far" | "near";

export type Distractor = {
  hebrew: string;
  type: DistractorType;
  reason: string;
};

/**
 * Identifies verbs from the user's known words
 */
export function getUserKnownVerbs(): string[] {
  const knownWords = readKnownWords();
  const knownVerbs = knownWords
    .filter((word) => word.partOfSpeech === "verb")
    .map((word) => word.hebrew);
  
  // Match against our verb conjugation database
  const matchedVerbs: string[] = [];
  for (const verb of verbConjugations) {
    // Check if any of the verb's forms match a known word
    const hasMatch = verb.forms.some((form) => knownVerbs.includes(form.hebrew));
    if (hasMatch) {
      matchedVerbs.push(verb.infinitive);
    }
  }
  
  return matchedVerbs;
}

/**
 * Gets the user's training level based on their known verbs
 * For prototype: use number of known verbs as proxy
 */
export function getUserLevel(): UserLevel {
  const knownVerbs = getUserKnownVerbs();
  if (knownVerbs.length <= 2) return 1;
  if (knownVerbs.length <= 5) return 2;
  return 3;
}

/**
 * Generates distractors for a given verb and requirement
 */
export function generateDistractors(
  verb: VerbRecord,
  correctForm: ConjugatedForm,
  userLevel: UserLevel,
): Distractor[] {
  const allDistractors: Distractor[] = [];
  
  // Near distractors: same verb, wrong tense or person
  for (const form of verb.forms) {
    if (form.hebrew === correctForm.hebrew) continue;
    
    // Wrong tense, same person/gender
    if (
      form.tense !== correctForm.tense &&
      form.person === correctForm.person &&
      (form.gender === correctForm.gender || form.gender === "common")
    ) {
      allDistractors.push({
        hebrew: form.hebrew,
        type: "near",
        reason: `Wrong tense: ${form.tense} instead of ${correctForm.tense}`,
      });
    }
    
    // Wrong person, same tense
    if (
      form.tense === correctForm.tense &&
      form.person !== correctForm.person
    ) {
      allDistractors.push({
        hebrew: form.hebrew,
        type: "near",
        reason: `Wrong person: ${form.person} instead of ${correctForm.person}`,
      });
    }
    
    // Wrong gender, same tense/person
    if (
      form.tense === correctForm.tense &&
      form.person === correctForm.person &&
      form.gender !== correctForm.gender &&
      form.gender !== "common" &&
      correctForm.gender !== "common"
    ) {
      allDistractors.push({
        hebrew: form.hebrew,
        type: "near",
        reason: `Wrong gender: ${form.gender} instead of ${correctForm.gender}`,
      });
    }
  }
  
  // Far distractors: different binyan or completely different forms
  for (const otherVerb of verbConjugations) {
    if (otherVerb.infinitive === verb.infinitive) continue;
    
    // Different binyan, same root would be ideal but we'll use any verb
    for (const form of otherVerb.forms) {
      // Match same tense but different binyan
      if (form.tense === correctForm.tense && otherVerb.binyan !== verb.binyan) {
        allDistractors.push({
          hebrew: form.hebrew,
          type: "far",
          reason: `Different binyan: ${otherVerb.binyan} instead of ${verb.binyan}`,
        });
      }
    }
  }
  
  return allDistractors;
}

/**
 * Selects distractors based on user level
 * Low level: mostly far distractors
 * High level: mostly near distractors
 */
export function selectDistractors(
  distractors: Distractor[],
  userLevel: UserLevel,
  count: number,
): Distractor[] {
  const nearDistractors = distractors.filter((d) => d.type === "near");
  const farDistractors = distractors.filter((d) => d.type === "far");
  
  const nearRatio = userLevel === 1 ? 0.2 : userLevel === 2 ? 0.5 : 0.8;
  const nearCount = Math.floor(count * nearRatio);
  const farCount = count - nearCount;
  
  // Shuffle and select
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  
  const selectedNear = shuffleArray(nearDistractors).slice(0, nearCount);
  const selectedFar = shuffleArray(farDistractors).slice(0, farCount);
  
  return [...selectedNear, ...selectedFar];
}

/**
 * Generates a single training question
 */
export function generateQuestion(
  verb: VerbRecord,
  template: SentenceTemplate,
  userLevel: UserLevel,
): TrainingQuestion | null {
  const { tense, person, gender, number } = template.verbRequirement;
  
  // Get the correct form
  const correctForm = getForm(verb, tense, person, gender, number);
  if (!correctForm) return null;
  
  // Generate distractors
  const allDistractors = generateDistractors(verb, correctForm, userLevel);
  if (allDistractors.length < 2) return null; // Need at least 2 distractors
  
  const selectedDistractors = selectDistractors(allDistractors, userLevel, 2);
  if (selectedDistractors.length < 2) return null;
  
  // Fill in the template
  const sentence = template.pattern.replace("{verb}", "{}");
  
  // Create choices array: [correct, distractor1, distractor2]
  const choices: [string[], string[], string[]] = [
    [correctForm.hebrew],
    [selectedDistractors[0].hebrew],
    [selectedDistractors[1].hebrew],
  ];
  
  return {
    id: `dynamic-${verb.infinitive}-${template.id}`,
    sentence,
    choices,
  };
}

/**
 * Generates N training questions based on known verbs
 */
export function generateTrainingQuestions(count: number = 5): TrainingQuestion[] {
  const knownVerbInfinitives = getUserKnownVerbs();
  const userLevel = getUserLevel();
  
  // If user has no known verbs, fallback to some default verbs
  const verbsToUse = knownVerbInfinitives.length > 0
    ? knownVerbInfinitives
    : verbConjugations.slice(0, 3).map((v) => v.infinitive);
  
  // Get templates for user's level
  const availableTemplates = sentenceTemplates.filter((t) => t.level <= userLevel);
  if (availableTemplates.length === 0) {
    // Fallback to level 1 templates
    availableTemplates.push(...sentenceTemplates.filter((t) => t.level === 1));
  }
  
  const questions: TrainingQuestion[] = [];
  const maxAttempts = count * 10; // Avoid infinite loops
  let attempts = 0;
  
  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Pick a random verb
    const verbInfinitive = verbsToUse[Math.floor(Math.random() * verbsToUse.length)];
    const verb = verbConjugations.find((v) => v.infinitive === verbInfinitive);
    if (!verb) continue;
    
    // Pick a random template
    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    // Generate question
    const question = generateQuestion(verb, template, userLevel);
    if (question) {
      // Check for duplicates
      const isDuplicate = questions.some((q) => q.id === question.id);
      if (!isDuplicate) {
        questions.push(question);
      }
    }
  }
  
  return questions;
}
