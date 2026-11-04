// Page-specific guidance. Module hours describe this app's design, not proven outcomes.
export const bandGuides: Record<string, { definition: string; task: string; steps: string[]; question: string; answer: string }> = {
  'early-elementary': {
    definition: 'The early elementary reading curriculum is a practice pathway for connecting printed letters with sounds, recognizing words and explaining simple stories. In HeyGetOnMyLevel, this band groups introductory decoding, vocabulary and comprehension activities. It describes the app’s practice content; it does not establish a child’s school reading level or replace instruction from a teacher.',
    task: 'Try a short story with a clear beginning and ending. Listen for how the learner blends unfamiliar words, then ask what happened. If sounding out each word uses all their attention, read a sentence together before asking about its meaning. Keep a note of the particular sound or word that needs another example.',
    steps: ['Choose a familiar topic and preview the title together.', 'Look at the letters in an unfamiliar word and practise blending its sounds.', 'Retell the story in order and point to a detail supporting the retelling.'],
    question: 'What if my child can retell a story but cannot read the words?',
    answer: 'Understanding a story heard aloud and decoding its printed words are different observations. Share an example with the teacher and ask which letter-sound work matches current instruction. Do not assign a new grade level from this practice session.'
  },
  'upper-elementary': {
    definition: 'The upper elementary reading curriculum is a practice pathway for longer words, vocabulary in context and explanations supported by a passage. HeyGetOnMyLevel groups these activities with work on inference and author purpose. The band names the content available in the app, rather than certifying that a learner meets a school assessment standard.',
    task: 'Use a short informational passage on a familiar topic. Ask the learner to distinguish the main point from an interesting detail. When an unfamiliar word appears, examine its parts and the surrounding sentence, then check the meaning. Ask how the new word changes the explanation of the passage instead of treating vocabulary as an isolated list.',
    steps: ['Preview the headings and state a question the passage might answer.', 'Separate a directly stated fact from an inference and identify its clue.', 'Write a short explanation that includes a supporting detail from the text.'],
    question: 'What if the learner reads smoothly but misses the main idea?',
    answer: 'Pause after a paragraph and ask what it adds to the passage. Compare the answer with the heading and supporting details. If this remains difficult, show the teacher a passage and response so the next activity targets understanding rather than reading speed.'
  },
  'middle-school': {
    definition: 'The middle school reading curriculum is a practice pathway for academic vocabulary, ideas connected across paragraphs and arguments supported by evidence. HeyGetOnMyLevel pairs word analysis with inference and source evaluation. This band describes a selection of practice tasks; it is not a placement decision, a qualification or a promise of academic progress.',
    task: 'Choose an article that presents an explanation or argument. Trace how each paragraph contributes: does it introduce a claim, give an example, supply evidence or raise an objection? Ask which unfamiliar terms belong to the subject. A learner may need background information before the argument becomes clear, even when the individual words are readable.',
    steps: ['Identify the central claim and the question it addresses.', 'Mark the evidence and explain how it supports the claim.', 'Compare the article with another source and identify an agreement or unresolved difference.'],
    question: 'How can I tell an inference from an unsupported guess?',
    answer: 'Ask for the textual clue and the reasoning that connects it to the conclusion. If the passage provides no clue, label the idea as a possibility to investigate. Practice should make the explanation visible rather than reward confidence alone.'
  },
  'high-school': {
    definition: 'The high school reading curriculum is a practice pathway for analyzing complex language, rhetorical choices and evidence across texts. HeyGetOnMyLevel organizes tasks around vocabulary, interpretation and critical reasoning. This is a description of the app’s learning activities, rather than a substitute for a course syllabus, examination result or teacher assessment of readiness.',
    task: 'Read an argument or literary extract with a specific question in mind. Identify a passage that could support more than one interpretation, then explain why one reading fits the surrounding text better. For an argument, separate the evidence offered from the conclusion drawn and notice any assumption connecting them. Keep disagreement grounded in the text.',
    steps: ['State the author’s purpose and intended audience using textual clues.', 'Explain how a word choice or structural choice affects meaning.', 'Write a claim, support it with evidence and address a plausible alternative interpretation.'],
    question: 'Does identifying a persuasive technique prove an argument is wrong?',
    answer: 'No. Naming a technique is the start of analysis. Examine whether the evidence supports the conclusion, whether important context is missing and how another source treats the same claim. Explain the reasoning rather than applying a label alone.'
  },
  'college-adult': {
    definition: 'The college and adult reading curriculum is a practice pathway for interpreting demanding texts, weighing sources and applying written information to a purpose. HeyGetOnMyLevel groups advanced vocabulary and critical comprehension activities here. Adults can choose another band for a particular task; the label describes practice content and does not define a person’s ability or qualifications.',
    task: 'Start with a public text connected to a real goal, such as a course description, policy explanation or research summary. Identify what decision the text informs and which details affect that decision. Keep personal records out of a practice passage. Summarize both what the source establishes and what remains uncertain before applying it elsewhere.',
    steps: ['Define the reading goal and inspect headings, authorship and publication context.', 'Distinguish a source’s reported finding from interpretation or recommendation.', 'Compare relevant sources and record any limitations that affect the conclusion.'],
    question: 'Should an adult always choose the most advanced band?',
    answer: 'Choose according to the task and the support you need. Familiarity with a subject, vocabulary and reading purpose can change how demanding a passage feels. A library literacy program or adult educator can help plan practice when independent work is frustrating.'
  }
};
