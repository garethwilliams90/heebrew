# Sentence Cogency Checking

The training question generator includes a two-layer cogency checking system to ensure generated sentences make semantic sense.

## Overview

The system validates that verb-object relationships are logical before showing questions to users. For example:
- ✅ "He writes a book" (cogent)
- ❌ "He reads an apple" (not cogent)

## Two-Layer Architecture

### Layer 1: Model-Based Check (Primary)
Uses OpenAI/Azure OpenAI to validate sentence cogency using natural language understanding.

**Advantages:**
- High accuracy
- Understands context and nuance
- Can handle complex sentences
- Catches edge cases

**Configuration:**
```env
# Option 1: OpenAI
OPENAI_API_KEY=sk-...

# Option 2: Azure OpenAI
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
```

**How it works:**
1. Sends sentence (Hebrew + English) to GPT-3.5/4
2. Model evaluates semantic coherence
3. Returns JSON: `{ cogent: boolean, reason?: string }`
4. Uses 2-second timeout for responsiveness
5. Falls back to Layer 2 on error/timeout

### Layer 2: Compatibility List (Fallback)
Rule-based system mapping verbs to compatible object types.

**Advantages:**
- Fast (no API calls)
- Works offline
- No external dependencies
- Deterministic results

**Compatibility Map:**
```typescript
const verbObjectCompatibility = {
  "לִכְתֹּב": ["letter", "book", "story", "word"],  // write
  "לִשְׁמֹר": ["guard", "keep", "watch"],           // guard
  "לְדַבֵּר": ["language", "Hebrew", "words"],      // speak
  // ... more mappings
};
```

**How it works:**
1. Extracts objects from sentence pattern
2. Checks if verb-object pairing is in compatibility list
3. Universal objects (thing, something) pass all checks
4. Incompatible objects (color, number) fail most checks

## Integration Points

### Question Generation
File: `lib/training/dynamic-questions.ts`

```typescript
// Generate question with cogency checking
const question = await generateQuestion(
  verb,
  template,
  userLevel,
  {
    checkCogency: true,  // Enable checking
    useModel: true,      // Try model first
  }
);
```

### Batch Generation
```typescript
// Generate 5 questions (filters non-cogent ones)
const questions = await generateTrainingQuestions(5, {
  checkCogency: true,  // Enable checking
  useModel: true,      // Try model first
});
```

### Training Round Builder
File: `lib/training/round.ts`

```typescript
// Use async version for cogency checking
const round = await buildTrainingRoundAsync(null, undefined, {
  checkCogency: true,
  useModel: true,
});
```

## Configuration Options

### Enable/Disable Checking
```typescript
generateTrainingQuestions(5, {
  checkCogency: false,  // Skip cogency checks (faster)
});
```

### Model vs Fallback
```typescript
generateTrainingQuestions(5, {
  checkCogency: true,
  useModel: false,  // Use fallback only (faster, offline)
});
```

### Custom Timeout
```typescript
await checkSentenceCogency(verb, pattern, english, {
  useModel: true,
  modelTimeout: 5000,  // 5 seconds
});
```

## Fallback Behavior

The system is designed to be permissive and graceful:

1. **No API Key**: Falls back to compatibility list immediately
2. **API Error**: Catches error, uses fallback
3. **Timeout**: Race condition ensures fast response
4. **Model Says OK**: Double-checks with fallback for safety
5. **Unknown Verb**: Permits by default (optimistic)

## Performance

**With Model (Online):**
- First check: ~500-1500ms per sentence
- Cached: Instant
- Timeout: 2000ms (configurable)

**Fallback Only (Offline):**
- < 1ms per sentence
- No external dependencies
- Deterministic

**Batch Processing:**
- Generates questions in parallel
- 5 questions: ~1-3 seconds total with model
- 5 questions: < 10ms total with fallback only

## Logging

Rejected sentences are logged for debugging:
```
Rejected sentence for cogency: "He reads an apple" 
(model: incompatible verb-object)
```

## Extending the System

### Add More Verbs
Edit `lib/training/sentence-cogency.ts`:

```typescript
const verbObjectCompatibility: Record<string, string[]> = {
  "לִכְתֹּב": ["letter", "book", "story"],
  "YOUR_NEW_VERB": ["object1", "object2"],  // Add here
};
```

### Add Hebrew-English Mappings
```typescript
const hebrewToEnglish: Record<string, string> = {
  "סֵפֶר": "book",
  "YOUR_HEBREW": "your_english",  // Add here
};
```

### Customize Model Prompt
Edit `checkSentenceCogencyWithModel()` in `lib/training/sentence-cogency.ts`:

```typescript
{
  role: "system",
  content: "Your custom prompt here..."
}
```

## Environment Setup

### Development (.env.local)
```env
# Option 1: Use OpenAI directly
OPENAI_API_KEY=sk-...

# Option 2: Use Azure OpenAI (recommended for production)
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Existing Azure services (already configured)
AZURE_TRANSLATOR_KEY=...
AZURE_TRANSLATOR_REGION=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=...
```

### Production
Same environment variables, but ensure:
- Rate limits are appropriate
- Timeout is configured for your latency
- Fallback is tested and working
- Consider caching results

## Testing

### Test Model Check
```typescript
const result = await checkSentenceCogencyWithModel(
  "הוּא כּוֹתֵב סֵפֶר",
  "He writes a book"
);
console.log(result); // { cogent: true, method: "model" }
```

### Test Fallback
```typescript
const result = checkSentenceCogencyFallback(
  verbRecord,
  "הוּא כּוֹתֵב סֵפֶר"
);
console.log(result); // true
```

### Test Full Pipeline
```typescript
const questions = await generateTrainingQuestions(5, {
  checkCogency: true,
  useModel: true,
});
console.log(`Generated ${questions.length} cogent questions`);
```

## Troubleshooting

**No questions generated:**
- Check that verbs exist in database
- Verify templates match user level
- Increase maxAttempts in generateTrainingQuestions
- Disable cogency checking temporarily to test

**Model always timing out:**
- Increase modelTimeout
- Check API key configuration
- Test API connection separately
- Fall back to compatibility list only

**Too many false positives:**
- Tighten compatibility list
- Adjust model prompt
- Add more specific incompatible objects

**Too many false negatives:**
- Relax compatibility list
- Add universal objects
- Use model-only (disable fallback check)

## Files

- `lib/training/sentence-cogency.ts` - Core checking logic
- `lib/training/dynamic-questions.ts` - Integration
- `lib/training/round.ts` - Async round builder
- `components/training/training-session.tsx` - UI integration
