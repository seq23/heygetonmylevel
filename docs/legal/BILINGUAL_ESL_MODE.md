# Bilingual ESL Mode — Technical & Pedagogical Documentation

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Purpose:** Comprehensive reference for the bilingual (Spanish ↔ English) learning mode

---

## 1. Overview

HeyGetOnMyLevel includes a **Bilingual ESL Mode** designed for **Spanish-speaking learners who are building English reading skills**. When a user toggles the language to Spanish (🇪🇸) on the homepage, the application enters this mode automatically.

This is **not** a full Spanish translation of the app. It is a deliberate **scaffolded bilingual approach** rooted in ESL/ELL (English as a Second Language / English Language Learner) best practices: the learner receives **guidance and instruction in their native language (Spanish)** while **practicing reading in the target language (English)**.

---

## 2. What Changes in Bilingual Mode

| Component | Language | Rationale |
|-----------|----------|-----------|
| **Reading passages** | 🇺🇸 English | The learner is practicing English reading comprehension |
| **Passage titles** | 🇺🇸 English | Titles are part of the reading material |
| **Comprehension questions** | 🇪🇸 Spanish | So the learner understands what is being asked |
| **Answer choices / options** | 🇪🇸 Spanish | So the learner can select answers confidently |
| **Explanations (why an answer is correct)** | 🇪🇸 Spanish | So the learner understands the reasoning |
| **AI Reading Buddy (tutor)** | 🇪🇸 Spanish | Guides the learner in their native language; references English words from the passage when explaining vocabulary |
| **Evaluate / feedback responses** | 🇪🇸 Spanish | Encouraging feedback the learner can understand |
| **Read-aloud exercises** | 🇺🇸 English | The learner is practicing English pronunciation and fluency |
| **Assessment passages** | 🇺🇸 English | Assessing English reading ability |
| **Assessment questions** | 🇪🇸 Spanish | So the learner understands the assessment prompts |
| **Vocabulary confirmation passages** | 🇺🇸 English | Confirming English vocabulary level |
| **Vocabulary confirmation questions** | 🇪🇸 Spanish | So the learner understands what is being tested |
| **UI labels, buttons, navigation** | 🇪🇸 Spanish | So the learner can navigate the app comfortably |
| **Static help tips** | 🇪🇸 Spanish | Reading strategy tips in the learner's native language |
| **Welcome tutorial (Reading Buddy)** | 🇪🇸 Spanish | Onboarding instructions the learner can follow |
| **Text-to-speech (TTS) voice** | Matches content language | English voice for passages/read-aloud; Spanish voice for tutor/UI |

---

## 3. Pedagogical Basis

This approach mirrors established ESL/ELL instructional strategies:

### 3.1 Native Language Scaffolding
Research consistently shows that providing instruction and guidance in a learner's native language (L1) while they practice skills in the target language (L2) improves comprehension, reduces anxiety, and accelerates acquisition.

### 3.2 Comprehensible Input
By keeping questions and explanations in Spanish, the learner can focus cognitive effort on **decoding and comprehending the English passage** rather than struggling to understand what is being asked of them.

### 3.3 Code-Referencing
The AI Reading Buddy communicates in Spanish but **references English words from the passage** when explaining vocabulary or reading concepts. This bridges the two languages naturally, helping the learner build connections between L1 and L2.

### 3.4 Fluency Practice in Target Language
Read-aloud exercises remain in English because the learner is practicing **English pronunciation, fluency, and prosody** — skills that must be developed in the target language.

---

## 4. Technical Implementation

### 4.1 Language Context
- Language selection is managed by `LanguageContext` (`src/contexts/LanguageContext.tsx`)
- The active language (`"en"` or `"es"`) is persisted in `localStorage` under key `app_language`
- A `t()` helper function provides translated UI strings from an in-file dictionary
- Language preference is **never transmitted to any server** for storage — it is only sent as a parameter in API calls to control content generation

### 4.2 Backend (Edge Function)
- The `generate-reading` edge function (`supabase/functions/generate-reading/index.ts`) receives a `language` parameter
- When `language === "es"`, the function uses **bilingual system prompts**:
  - Passage generation prompts explicitly instruct: "Generate the passage in ENGLISH"
  - Question generation prompts instruct: "The passage is in English but the student speaks Spanish. Generate questions, options, and explanations in SPANISH"
  - Tutor prompts instruct: "Communicate in Spanish but reference English words from the passage"
  - Read-aloud prompts always generate English sentences regardless of language setting

### 4.3 Client-Side Language Passing
All edge function invocations pass the `language` parameter:
- `getCachedOrGeneratePassage()` — passes `language` for passage + question generation
- `generateQuestions()` — passes `language` for question-only generation
- `evaluateAnswer()` — passes `language` for feedback generation
- `generateReadAloudSentences()` — passes `language` (backend ignores it for content, keeps English)
- `generateVocabularyConfirmation()` — passes `language` for question translation
- `generateAssessment()` / `generateBatchedAssessment()` — passes `language`
- `AITutor` component — passes `language` for tutor responses

### 4.4 Text-to-Speech
- The `useTextToSpeech` hook (`src/hooks/useTextToSpeech.ts`) accepts a `language` parameter
- When `language === "es"`, it selects Spanish voices (preferring `es-US` / `es-MX` locales)
- When `language === "en"`, it selects English voices (preferring `en-US`)
- Voice selection follows a priority chain: preferred named voice → locale match → fallback

### 4.5 Speech Recognition
- The `useSpeechRecognition` hook configures the browser's speech recognition API with the appropriate locale (`es-US` or `en-US`)
- For read-aloud exercises, English recognition is used regardless of UI language since the student is reading English text

---

## 5. User Experience Flow

1. **User arrives at homepage** → UI is in English by default
2. **User taps 🇪🇸 toggle** → UI switches to Spanish; `localStorage` saves preference
3. **User starts a reading session** → Passage is generated in **English**
4. **User reads the English passage** → Can tap any word to hear it pronounced in English
5. **User taps "Estoy Listo para las Preguntas"** → Questions appear in **Spanish** about the English passage
6. **User answers a question** → Feedback/explanation appears in **Spanish**, referencing the English text
7. **AI Reading Buddy** → Speaks **Spanish**, but references English vocabulary from the passage
8. **Read-aloud assessment** → Sentences are in **English**; user reads them aloud in English

---

## 6. What This Mode Is NOT

- ❌ **Not a full Spanish translation** — Reading content is intentionally in English
- ❌ **Not a Spanish reading practice tool** — The goal is English literacy
- ❌ **Not machine-translated** — AI generates native-quality Spanish questions and guidance contextually
- ❌ **Not a language learning app** — It is a reading comprehension tool with bilingual scaffolding

---

## 7. Privacy Considerations

- Language preference is stored **only in the browser** (`localStorage`)
- The `language` parameter is sent in API requests solely to control content generation language
- No language preference is stored server-side or associated with any user identity
- See [Privacy Policy](PRIVACY_POLICY.md) and [Zero-PII Compliance](ZERO_PII_COMPLIANCE_IMPLICATIONS.md) for full details

---

## 8. Future Extensibility

The bilingual architecture is designed to support additional native languages:
- The `LanguageContext` type system supports adding new language codes
- The edge function's `isSpanish` check can be generalized to a `nativeLanguage` parameter
- UI translation dictionary can be extended with additional language columns
- TTS voice selection already follows a locale-based priority chain

Adding a new native language (e.g., Mandarin, Arabic) would require:
1. Adding translations to the `LanguageContext` dictionary
2. Updating edge function prompts to support the new language
3. Adding TTS voice selection for the new locale
4. Testing AI content generation quality in the new language

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial document — bilingual ESL mode architecture and rationale |
