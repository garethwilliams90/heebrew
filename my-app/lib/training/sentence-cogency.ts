/**
 * Sentence cogency checking: validates that generated sentences make semantic sense
 * 
 * Two-layer approach:
 * 1. Model-based check using OpenAI (when available)
 * 2. Fallback verb-object compatibility list
 */

import type { VerbRecord } from "./verb-conjugations";

// Verb-to-object compatibility list (fallback layer)
// Maps verb infinitives to compatible object types
const verbObjectCompatibility: Record<string, string[]> = {
  // Pa'al verbs
  "לִכְתֹּב": ["letter", "book", "story", "word", "name", "document", "message"],
  "לִשְׁמֹר": ["guard", "keep", "watch", "preserve", "maintain"],
  "לִלְבֹּשׁ": ["wear", "clothing", "shirt", "dress", "pants", "shoes"],
  
  // Pi'el verbs
  "לְדַבֵּר": ["speak", "talk", "language", "Hebrew", "words"],
  "לְשַׁבֵּר": ["break", "glass", "window", "vase", "plate", "door"],
  "לְסַדֵּר": ["arrange", "organize", "room", "office", "boxes", "papers"],
  
  // Hif'il verbs
  "לְהַגְדִּיל": ["enlarge", "expand", "increase", "house", "office", "picture"],
  "לְהַזְכִּיר": ["remind", "mention", "about", "truth", "story"],
  "לְהַסְבִּיר": ["explain", "clarify", "lesson", "truth", "story"],
};

// Common objects that work with many verbs
const universalObjects = new Set([
  "thing", "something", "it", "that",
]);

// Objects that typically don't make sense with action verbs
const incompatibleObjects = new Set([
  "color", "number", "feeling", "emotion", "abstract concept",
]);

/**
 * Check verb-object compatibility using the fallback list
 */
export function checkVerbObjectCompatibility(
  verbInfinitive: string,
  objectWord: string,
): boolean {
  // Universal objects work with most verbs
  if (universalObjects.has(objectWord.toLowerCase())) {
    return true;
  }
  
  // Known incompatible objects
  if (incompatibleObjects.has(objectWord.toLowerCase())) {
    return false;
  }
  
  const compatible = verbObjectCompatibility[verbInfinitive];
  if (!compatible) {
    // Unknown verb, be permissive
    return true;
  }
  
  // Check if object matches any compatible type
  const objectLower = objectWord.toLowerCase();
  return compatible.some((type) => 
    objectLower.includes(type) || type.includes(objectLower)
  );
}

/**
 * Extract object nouns from a Hebrew sentence pattern
 * This is simplified - in production, you'd parse the sentence properly
 */
function extractObjectsFromPattern(pattern: string): string[] {
  // For now, we'll extract recognizable English words from patterns
  // In a real implementation, you'd maintain a mapping of Hebrew words to English
  const hebrewToEnglish: Record<string, string> = {
    "סֵפֶר": "book",
    "מִכְתָּב": "letter",
    "עִבְרִית": "Hebrew",
    "הַשִּׁעוּר": "lesson",
    "הַדֶּלֶת": "door",
    "סֵפֶר חָדָשׁ": "new book",
    "הַחֶדֶר": "room",
    "הַבַּיִת": "house",
    "הַמִּשְׂרָד": "office",
    "הַקּוּפְסָאוֹת": "boxes",
    "הָאֱמֶת": "truth",
    "הַסִּפּוּר": "story",
  };
  
  const objects: string[] = [];
  for (const [hebrew, english] of Object.entries(hebrewToEnglish)) {
    if (pattern.includes(hebrew)) {
      objects.push(english);
    }
  }
  
  return objects;
}

/**
 * Model-based cogency check using OpenAI
 * Validates that a sentence makes semantic sense
 */
export async function checkSentenceCogencyWithModel(
  sentence: string,
  englishPattern: string,
): Promise<{ cogent: boolean; reason?: string }> {
  try {
    // Check if OpenAI is configured
    const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY;
    if (!apiKey) {
      // Fall back to compatibility check
      return { cogent: true }; // Permissive when model unavailable
    }
    
    // Use OpenAI to validate sentence cogency
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
      ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`
      : "https://api.openai.com/v1/chat/completions";
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (process.env.AZURE_OPENAI_KEY) {
      headers["api-key"] = process.env.AZURE_OPENAI_KEY;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Hebrew language teacher validating whether practice sentences make semantic sense. Respond with a JSON object containing 'cogent' (boolean) and optionally 'reason' (string). A sentence is cogent if the verb and object make logical sense together (e.g., 'read a book' is cogent, 'read an apple' is not).",
          },
          {
            role: "user",
            content: `Validate this sentence for cogency:\nEnglish: "${englishPattern}"\nHebrew: "${sentence}"\n\nDoes this sentence make semantic sense? Is the verb-object relationship logical?`,
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
        response_format: { type: "json_object" },
      }),
    });
    
    if (!response.ok) {
      console.warn("Model cogency check failed, falling back to compatibility list");
      return { cogent: true }; // Be permissive on error
    }
    
    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { cogent: true };
    }
    
    const result = JSON.parse(content) as { cogent: boolean; reason?: string };
    return result;
  } catch (error) {
    console.warn("Model cogency check error:", error);
    return { cogent: true }; // Be permissive on error
  }
}

/**
 * Fallback cogency check using verb-object compatibility list
 * Faster and doesn't require external API
 */
export function checkSentenceCogencyFallback(
  verb: VerbRecord,
  sentencePattern: string,
): boolean {
  const objects = extractObjectsFromPattern(sentencePattern);
  
  // If no objects found, sentence is likely cogent (might be intransitive)
  if (objects.length === 0) {
    return true;
  }
  
  // Check each object against verb compatibility
  return objects.every((obj) => 
    checkVerbObjectCompatibility(verb.infinitive, obj)
  );
}

/**
 * Main cogency check that tries model first, falls back to compatibility list
 */
export async function checkSentenceCogency(
  verb: VerbRecord,
  sentencePattern: string,
  englishPattern: string,
  options: {
    useModel?: boolean;
    modelTimeout?: number;
  } = {},
): Promise<{ cogent: boolean; reason?: string; method: "model" | "fallback" | "skipped" }> {
  const { useModel = true, modelTimeout = 3000 } = options;
  
  // If model is disabled or unavailable, use fallback immediately
  if (!useModel || (!process.env.OPENAI_API_KEY && !process.env.AZURE_OPENAI_KEY)) {
    const cogent = checkSentenceCogencyFallback(verb, sentencePattern);
    return { cogent, method: "fallback" };
  }
  
  try {
    // Try model-based check with timeout
    const modelCheck = checkSentenceCogencyWithModel(sentencePattern, englishPattern);
    const timeoutPromise = new Promise<{ cogent: boolean; reason?: string }>((resolve) => {
      setTimeout(() => resolve({ cogent: true }), modelTimeout);
    });
    
    const result = await Promise.race([modelCheck, timeoutPromise]);
    
    // If model check timed out or was permissive, double-check with fallback
    if (!result.cogent) {
      return { ...result, method: "model" };
    }
    
    // Validate with fallback as well for extra safety
    const fallbackCogent = checkSentenceCogencyFallback(verb, sentencePattern);
    if (!fallbackCogent) {
      return { 
        cogent: false, 
        reason: "Failed fallback compatibility check",
        method: "fallback",
      };
    }
    
    return { ...result, method: "model" };
  } catch (error) {
    console.warn("Model check failed, using fallback:", error);
    const cogent = checkSentenceCogencyFallback(verb, sentencePattern);
    return { cogent, method: "fallback" };
  }
}

/**
 * Batch check multiple sentences for cogency
 * Useful for filtering generated questions
 */
export async function filterCogentSentences(
  candidates: Array<{
    verb: VerbRecord;
    sentencePattern: string;
    englishPattern: string;
  }>,
  options?: {
    useModel?: boolean;
    modelTimeout?: number;
  },
): Promise<Array<{
  verb: VerbRecord;
  sentencePattern: string;
  englishPattern: string;
  cogencyCheck: { cogent: boolean; reason?: string; method: string };
}>> {
  const results = await Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      cogencyCheck: await checkSentenceCogency(
        candidate.verb,
        candidate.sentencePattern,
        candidate.englishPattern,
        options,
      ),
    })),
  );
  
  return results;
}
