import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PassageRequest {
  type: "passage" | "questions" | "assessment" | "assessment_batch" | "evaluate" | "tutor" | "read_aloud" | "vocabulary_confirmation";
  gradeLevel?: number;
  skillFocus?: string;
  theme?: string;
  passageText?: string;
  question?: string;
  userAnswer?: string;
  correctAnswer?: string;
  userQuestion?: string;
  currentQuestion?: string;
}

const getGradeDescription = (level: number): string => {
  if (level <= 2) return "very simple words, short sentences (5-8 words), basic vocabulary, concrete concepts only";
  if (level <= 4) return "simple vocabulary, sentences of 8-12 words, everyday topics, clear cause and effect";
  if (level <= 6) return "moderate vocabulary, sentences of 10-15 words, some abstract concepts, straightforward structure";
  if (level <= 8) return "varied vocabulary, complex sentences up to 20 words, multiple paragraph structure, inference required";
  if (level <= 10) return "advanced vocabulary, complex sentence structures, abstract reasoning, nuanced themes";
  if (level <= 12) return "sophisticated vocabulary, varied sentence complexity, analytical thinking required";
  return "college-level vocabulary, complex academic prose, critical analysis required";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, gradeLevel, skillFocus, theme, passageText, question, userAnswer, correctAnswer, userQuestion, currentQuestion } = await req.json() as PassageRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";
    let maxTokens: number | undefined = undefined; // Strategy 5: Conditionally set max_tokens

    const level = gradeLevel || 5;

    if (type === "passage") {
      const gradeDesc = getGradeDescription(level);
      systemPrompt = `You are an expert reading comprehension teacher. Generate engaging, age-appropriate reading passages that precisely match Flesch-Kincaid grade levels. Your passages should be interesting, educational, and suitable for readers of all ages who are practicing at this level.`;
      
      // Build topic instruction based on whether theme is provided
      const topicInstruction = theme 
        ? `- Topic/Theme: "${theme}" - Create content around this theme while keeping it age-appropriate and educational`
        : "- Topic: Choose an interesting, universally relatable topic (nature, daily life, simple science, stories)";
      
      userPrompt = `Generate a reading passage for Grade ${level} level (Flesch-Kincaid).

Requirements:
- Reading level: ${gradeDesc}
- Length: ${level <= 1 ? "30-50" : level <= 2 ? "50-80" : level <= 3 ? "80-120" : level <= 4 ? "100-150" : level <= 6 ? "150-200" : level <= 8 ? "200-250" : "200-300"} words
${topicInstruction}
- Skill focus: ${skillFocus || "general comprehension"}
${skillFocus === "phonics" ? `- PHONICS FOCUS: Use words with clear, consistent sound patterns (e.g., rhyming words, word families like -at, -ig, -op). Include repetition of key sounds. Make the passage fun to read aloud.` : ""}
${theme ? `- IMPORTANT: Incorporate the "${theme}" theme naturally into an engaging story or informational passage` : ""}

Return ONLY a JSON object in this exact format:
{
  "title": "Passage Title",
  "text": "The full passage text here...",
  "topic": "brief topic description"
}`;
    } else if (type === "questions") {
      const gradeDesc = getGradeDescription(level);
      systemPrompt = `You are an expert reading comprehension teacher creating questions that test understanding at the appropriate reading level. Questions should be clear, fair, and directly related to the passage.`;
      
      // Skill-focused question generation
      let questionTypeInstruction = "";
      let questionTypes = "recall|inference|vocabulary|cause_effect";
      
      if (skillFocus === "vocabulary") {
        questionTypeInstruction = "ALL 4 questions MUST focus on vocabulary and word meanings from the passage. Ask about word definitions, context clues, synonyms, and word usage.";
        questionTypes = "vocabulary";
      } else if (skillFocus === "inference") {
        questionTypeInstruction = "ALL 4 questions MUST require making inferences from the text. Ask about implied meanings, conclusions, predictions, and reading between the lines.";
        questionTypes = "inference";
      } else if (skillFocus === "cause_effect") {
        questionTypeInstruction = "ALL 4 questions MUST focus on cause and effect relationships. Ask why things happen, what causes events, and what results from actions.";
        questionTypes = "cause_effect";
      } else if (skillFocus === "phonics") {
        questionTypeInstruction = "ALL 4 questions MUST focus on phonics: letter sounds, blending sounds together, rhyming words, beginning/ending sounds, vowel sounds, and sound patterns. Make questions accessible for all ages and ability levels.";
        questionTypes = "vocabulary";
      } else if (skillFocus === "decoding") {
        questionTypeInstruction = "ALL 4 questions MUST focus on word decoding, phonics patterns, and word structure. Ask about word parts, syllables, prefixes, suffixes, and sound patterns.";
        questionTypes = "vocabulary";
      } else if (skillFocus === "reasoning" || skillFocus === "critical") {
        questionTypeInstruction = "ALL 4 questions MUST require critical thinking and multi-step reasoning. Ask about analysis, evaluation, comparing ideas, and drawing complex conclusions.";
        questionTypes = "inference";
      } else if (skillFocus === "comprehension" || skillFocus === "recall") {
        questionTypeInstruction = "ALL 4 questions MUST focus on recall and basic comprehension. Ask about specific facts, events, characters, and directly stated information.";
        questionTypes = "recall";
      } else {
        questionTypeInstruction = "Include a mix of different question types: recall, inference, vocabulary, and cause_effect.";
      }
      
      userPrompt = `Create 4 comprehension questions for this passage (Grade ${level} level):

"${passageText}"

Requirements:
- Question complexity: ${gradeDesc}
- ${questionTypeInstruction}
- Each question has 4 answer options
- Questions should match the reading level

Return ONLY a JSON array in this exact format:
[
  {
    "text": "Question text here?",
    "type": "${questionTypes}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The correct option text exactly as written",
    "explanation": "Brief explanation of why this is correct (${level <= 4 ? "1-2 simple sentences" : "2-3 sentences"})"
  }
]`;
    } else if (type === "assessment") {
      systemPrompt = `You are an expert reading diagnostician. Create assessment passages that help determine a reader's level. Start at the specified level and create content that can help gauge comprehension ability.`;
      
      userPrompt = `Create an assessment passage starting at Grade ${level} level.

Requirements:
- Create a passage of about 150 words
- Include 3 questions of varying difficulty
- Questions should test: basic recall, inference, and vocabulary

Return ONLY a JSON object:
{
  "passage": {
    "title": "Title",
    "text": "Passage text...",
    "gradeLevel": ${level}
  },
  "questions": [
    {
      "text": "Question?",
      "type": "recall|inference|vocabulary",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Correct option",
      "explanation": "Brief explanation",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;
    } else if (type === "assessment_batch") {
      // Strategy 6: Generate all 3 difficulty levels in ONE call
      systemPrompt = `You are an expert reading diagnostician. Create assessment passages at multiple difficulty levels to efficiently gauge a reader's ability. Generate content for three levels in a single response.`;
      
      const easyLevel = Math.max(1, level - 2);
      const mediumLevel = level;
      const hardLevel = Math.min(13, level + 2);
      
      userPrompt = `Create assessment content at THREE difficulty levels based on starting Grade ${level}.

Generate passages and questions for:
1. EASY: Grade ${easyLevel} level
2. MEDIUM: Grade ${mediumLevel} level  
3. HARD: Grade ${hardLevel} level

Each level needs:
- A passage of about 120-150 words appropriate for that grade
- 2 questions testing recall and inference

Return ONLY a JSON object:
{
  "easy": {
    "passage": { "title": "Title", "text": "Passage text...", "gradeLevel": ${easyLevel} },
    "questions": [
      { "text": "Question?", "type": "recall|inference", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct option", "explanation": "Brief explanation", "difficulty": "easy" }
    ]
  },
  "medium": {
    "passage": { "title": "Title", "text": "Passage text...", "gradeLevel": ${mediumLevel} },
    "questions": [
      { "text": "Question?", "type": "recall|inference", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct option", "explanation": "Brief explanation", "difficulty": "medium" }
    ]
  },
  "hard": {
    "passage": { "title": "Title", "text": "Passage text...", "gradeLevel": ${hardLevel} },
    "questions": [
      { "text": "Question?", "type": "recall|inference", "options": ["A", "B", "C", "D"], "correctAnswer": "Correct option", "explanation": "Brief explanation", "difficulty": "hard" }
    ]
  }
}`;
    } else if (type === "evaluate") {
      const gradeDesc = getGradeDescription(level);
      systemPrompt = `You are a supportive reading tutor. Provide encouraging, educational feedback that helps readers understand and improve. Adapt your explanation to the reader's level.`;
      
      userPrompt = `The reader answered a comprehension question.

Question: "${question}"
Their answer: "${userAnswer}"
Correct answer: "${correctAnswer}"
Reader's level: Grade ${level} (${gradeDesc})

Provide a brief, encouraging explanation (${level <= 4 ? "1-2 simple sentences" : "2-3 sentences"}) that:
- Acknowledges their effort
- Explains the concept clearly at their level
- If incorrect, gently guides them to understanding

Return ONLY a JSON object:
{
  "isCorrect": true/false,
  "feedback": "Your encouraging feedback here..."
}`;
    } else if (type === "tutor") {
      const gradeDesc = getGradeDescription(level);
      // Strategy 5: Limit tutor response tokens
      maxTokens = 100;
      
      systemPrompt = `You are a friendly, encouraging reading buddy for a student at Grade ${level} level. Your job is to:
- Help them understand the passage without giving away answers
- Give hints when asked, but encourage them to think
- Explain difficult words or concepts in simpler terms
- Be warm, supportive, and age-appropriate
- Keep responses SHORT (1-3 sentences only!)
- Never directly reveal answers to comprehension questions`;
      
      userPrompt = `The student is reading this passage:
"${passageText}"

${currentQuestion ? `They are currently working on this question: "${currentQuestion}"` : ""}

The student asks: "${userQuestion}"

Respond helpfully at their level (${gradeDesc}). Be encouraging and guide them to think, but don't give away answers directly. Keep it to 1-3 sentences MAX.

Return ONLY a JSON object:
{
  "response": "Your friendly, helpful response here..."
}`;
    } else if (type === "read_aloud") {
      const gradeDesc = getGradeDescription(level);
      systemPrompt = `You are an expert reading teacher creating sentences for students to read aloud. Generate age-appropriate sentences that match the specified grade level.`;
      
      userPrompt = `Create 3 sentences for a Grade ${level} student to read aloud.

Requirements:
- Reading level: ${gradeDesc}
- Grade 1-2: 5-8 words per sentence, simple CVC words, common sight words
- Grade 3-4: 8-12 words per sentence, common vocabulary
- Grade 5-6: 10-15 words per sentence, varied vocabulary
- Grade 7+: 12-20 words per sentence, complex vocabulary

Make sentences interesting and engaging. They should flow naturally when read aloud.

Return ONLY a JSON object:
{
  "sentences": ["First sentence here.", "Second sentence here.", "Third sentence here."]
}`;
    } else if (type === "vocabulary_confirmation") {
      const gradeDesc = getGradeDescription(level);
      
      // Diverse topic pool for variety on each generation
      const confirmationTopics = [
        "a curious inventor and their workshop",
        "deep ocean exploration and sea creatures",
        "a hidden garden behind an old house",
        "astronauts on a space station",
        "an ancient library with mysterious books",
        "mountain climbers reaching a summit",
        "an unlikely friendship between animals",
        "a mysterious island discovery",
        "time capsules from the past",
        "urban wildlife in a busy city",
        "music bringing people together",
        "unusual weather phenomena",
        "underground caves and crystals",
        "forest ecosystems and their inhabitants",
        "cultural traditions from around the world",
        "a scientific breakthrough",
        "helpful robots in everyday life",
        "an artist's creative journey",
        "conservation efforts saving animals",
        "historical mysteries solved",
        "a baker's secret recipe",
        "migrating birds and their journey",
        "a young detective solving puzzles",
        "renewable energy and the future",
        "ancient civilizations and artifacts"
      ];
      
      // Randomly select a topic for this request
      const randomTopic = confirmationTopics[Math.floor(Math.random() * confirmationTopics.length)];
      const variationSeed = Date.now() % 10000;
      
      systemPrompt = `You are an expert reading comprehension teacher. Create a short, UNIQUE passage with questions to confirm a reader's level. Generate fresh, original content each time.`;
      
      userPrompt = `Create a SHORT confirmation passage for Grade ${level} level.

IMPORTANT: Generate UNIQUE content about "${randomTopic}" (variation seed: ${variationSeed})

Requirements:
- Reading level: ${gradeDesc}
- Topic: Create an engaging passage specifically about "${randomTopic}"
- Make it fresh, creative, and different from typical educational content
- Length: ${level <= 4 ? "60-80" : "80-120"} words only
- Create 2 simple questions to confirm comprehension

Return ONLY a JSON object:
{
  "title": "Short Title",
  "text": "The passage text here...",
  "questions": [
    {
      "text": "Question 1?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "The correct option",
      "explanation": "Brief explanation"
    },
    {
      "text": "Question 2?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "The correct option",
      "explanation": "Brief explanation"
    }
  ]
}`;
    }

    // Build request body
    const requestBody: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };

    // Strategy 5: Add max_tokens for tutor requests only
    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Parse the JSON from the response
    let result;
    try {
      // Find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-reading function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
