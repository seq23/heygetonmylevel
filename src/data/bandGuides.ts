// Page-specific guidance. Module hours describe this app's design, not proven outcomes.
// Every English string has a Spanish counterpart (*Es) so the page never mixes languages.
export interface BandGuide {
  definition: string;
  definitionEs: string;
  task: string;
  taskEs: string;
  steps: string[];
  stepsEs: string[];
  question: string;
  questionEs: string;
  answer: string;
  answerEs: string;
}

export const bandGuides: Record<string, BandGuide> = {
  'early-elementary': {
    definition: 'The early elementary reading curriculum is a practice pathway for connecting printed letters with sounds, recognizing words and explaining simple stories. In HeyGetOnMyLevel, this band groups introductory decoding, vocabulary and comprehension activities. It describes the app’s practice content; it does not establish a child’s school reading level or replace instruction from a teacher.',
    definitionEs: 'El currículo de lectura de primaria temprana es una ruta de práctica para conectar las letras impresas con los sonidos, reconocer palabras y explicar historias sencillas. En HeyGetOnMyLevel, esta banda agrupa actividades introductorias de decodificación, vocabulario y comprensión. Describe el contenido de práctica de la aplicación; no establece el nivel de lectura escolar de un niño ni reemplaza la enseñanza de un maestro.',
    task: 'Try a short story with a clear beginning and ending. Listen for how the learner blends unfamiliar words, then ask what happened. If sounding out each word uses all their attention, read a sentence together before asking about its meaning. Keep a note of the particular sound or word that needs another example.',
    taskEs: 'Prueba un cuento corto con un comienzo y un final claros. Escucha cómo el estudiante combina los sonidos de las palabras desconocidas y luego pregunta qué pasó. Si pronunciar cada palabra le exige toda su atención, lean una oración juntos antes de preguntar por su significado. Anota el sonido o la palabra concreta que necesita otro ejemplo.',
    steps: ['Choose a familiar topic and preview the title together.', 'Look at the letters in an unfamiliar word and practise blending its sounds.', 'Retell the story in order and point to a detail supporting the retelling.'],
    stepsEs: ['Elige un tema conocido y revisen el título juntos.', 'Observa las letras de una palabra desconocida y practica combinar sus sonidos.', 'Vuelve a contar la historia en orden y señala un detalle que apoye el relato.'],
    question: 'What if my child can retell a story but cannot read the words?',
    questionEs: '¿Qué pasa si mi hijo puede contar un cuento pero no leer las palabras?',
    answer: 'Understanding a story heard aloud and decoding its printed words are different observations. Share an example with the teacher and ask which letter-sound work matches current instruction. Do not assign a new grade level from this practice session.',
    answerEs: 'Comprender un cuento escuchado en voz alta y decodificar sus palabras impresas son observaciones diferentes. Comparte un ejemplo con el maestro y pregunta qué trabajo de letras y sonidos coincide con la enseñanza actual. No asignes un nuevo nivel de grado a partir de esta sesión de práctica.'
  },
  'upper-elementary': {
    definition: 'The upper elementary reading curriculum is a practice pathway for longer words, vocabulary in context and explanations supported by a passage. HeyGetOnMyLevel groups these activities with work on inference and author purpose. The band names the content available in the app, rather than certifying that a learner meets a school assessment standard.',
    definitionEs: 'El currículo de lectura de primaria superior es una ruta de práctica para palabras más largas, vocabulario en contexto y explicaciones apoyadas en un texto. HeyGetOnMyLevel agrupa estas actividades con trabajo de inferencia y propósito del autor. La banda nombra el contenido disponible en la aplicación, en lugar de certificar que un estudiante cumple un estándar de evaluación escolar.',
    task: 'Use a short informational passage on a familiar topic. Ask the learner to distinguish the main point from an interesting detail. When an unfamiliar word appears, examine its parts and the surrounding sentence, then check the meaning. Ask how the new word changes the explanation of the passage instead of treating vocabulary as an isolated list.',
    taskEs: 'Usa un texto informativo corto sobre un tema conocido. Pide al estudiante que distinga la idea principal de un detalle interesante. Cuando aparezca una palabra desconocida, examina sus partes y la oración que la rodea, y luego verifica el significado. Pregunta cómo la palabra nueva cambia la explicación del texto en lugar de tratar el vocabulario como una lista aislada.',
    steps: ['Preview the headings and state a question the passage might answer.', 'Separate a directly stated fact from an inference and identify its clue.', 'Write a short explanation that includes a supporting detail from the text.'],
    stepsEs: ['Revisa los encabezados y plantea una pregunta que el texto podría responder.', 'Separa un hecho dicho directamente de una inferencia e identifica su pista.', 'Escribe una explicación corta que incluya un detalle de apoyo del texto.'],
    question: 'What if the learner reads smoothly but misses the main idea?',
    questionEs: '¿Qué pasa si el estudiante lee con fluidez pero no capta la idea principal?',
    answer: 'Pause after a paragraph and ask what it adds to the passage. Compare the answer with the heading and supporting details. If this remains difficult, show the teacher a passage and response so the next activity targets understanding rather than reading speed.',
    answerEs: 'Haz una pausa después de un párrafo y pregunta qué aporta al texto. Compara la respuesta con el encabezado y los detalles de apoyo. Si esto sigue siendo difícil, muestra al maestro un texto y una respuesta para que la próxima actividad se enfoque en la comprensión y no en la velocidad de lectura.'
  },
  'middle-school': {
    definition: 'The middle school reading curriculum is a practice pathway for academic vocabulary, ideas connected across paragraphs and arguments supported by evidence. HeyGetOnMyLevel pairs word analysis with inference and source evaluation. This band describes a selection of practice tasks; it is not a placement decision, a qualification or a promise of academic progress.',
    definitionEs: 'El currículo de lectura de secundaria es una ruta de práctica para vocabulario académico, ideas conectadas entre párrafos y argumentos apoyados con evidencia. HeyGetOnMyLevel combina el análisis de palabras con la inferencia y la evaluación de fuentes. Esta banda describe una selección de tareas de práctica; no es una decisión de colocación, una calificación ni una promesa de progreso académico.',
    task: 'Choose an article that presents an explanation or argument. Trace how each paragraph contributes: does it introduce a claim, give an example, supply evidence or raise an objection? Ask which unfamiliar terms belong to the subject. A learner may need background information before the argument becomes clear, even when the individual words are readable.',
    taskEs: 'Elige un artículo que presente una explicación o un argumento. Sigue cómo contribuye cada párrafo: ¿presenta una afirmación, da un ejemplo, aporta evidencia o plantea una objeción? Pregunta qué términos desconocidos pertenecen al tema. Un estudiante puede necesitar información de contexto antes de que el argumento quede claro, aunque las palabras sueltas sean legibles.',
    steps: ['Identify the central claim and the question it addresses.', 'Mark the evidence and explain how it supports the claim.', 'Compare the article with another source and identify an agreement or unresolved difference.'],
    stepsEs: ['Identifica la afirmación central y la pregunta que aborda.', 'Marca la evidencia y explica cómo apoya la afirmación.', 'Compara el artículo con otra fuente e identifica un acuerdo o una diferencia sin resolver.'],
    question: 'How can I tell an inference from an unsupported guess?',
    questionEs: '¿Cómo distingo una inferencia de una suposición sin fundamento?',
    answer: 'Ask for the textual clue and the reasoning that connects it to the conclusion. If the passage provides no clue, label the idea as a possibility to investigate. Practice should make the explanation visible rather than reward confidence alone.',
    answerEs: 'Pide la pista del texto y el razonamiento que la conecta con la conclusión. Si el texto no ofrece ninguna pista, marca la idea como una posibilidad por investigar. La práctica debe hacer visible la explicación en lugar de premiar solo la confianza.'
  },
  'high-school': {
    definition: 'The high school reading curriculum is a practice pathway for analyzing complex language, rhetorical choices and evidence across texts. HeyGetOnMyLevel organizes tasks around vocabulary, interpretation and critical reasoning. This is a description of the app’s learning activities, rather than a substitute for a course syllabus, examination result or teacher assessment of readiness.',
    definitionEs: 'El currículo de lectura de preparatoria es una ruta de práctica para analizar lenguaje complejo, decisiones retóricas y evidencia entre varios textos. HeyGetOnMyLevel organiza las tareas en torno al vocabulario, la interpretación y el razonamiento crítico. Es una descripción de las actividades de aprendizaje de la aplicación, no un sustituto de un plan de estudios, un resultado de examen ni la evaluación de un maestro.',
    task: 'Read an argument or literary extract with a specific question in mind. Identify a passage that could support more than one interpretation, then explain why one reading fits the surrounding text better. For an argument, separate the evidence offered from the conclusion drawn and notice any assumption connecting them. Keep disagreement grounded in the text.',
    taskEs: 'Lee un argumento o un fragmento literario con una pregunta concreta en mente. Identifica un pasaje que admita más de una interpretación y luego explica por qué una lectura encaja mejor con el texto que la rodea. En un argumento, separa la evidencia ofrecida de la conclusión obtenida y nota cualquier suposición que las conecte. Mantén el desacuerdo basado en el texto.',
    steps: ['State the author’s purpose and intended audience using textual clues.', 'Explain how a word choice or structural choice affects meaning.', 'Write a claim, support it with evidence and address a plausible alternative interpretation.'],
    stepsEs: ['Indica el propósito del autor y su público previsto usando pistas del texto.', 'Explica cómo una elección de palabras o de estructura afecta el significado.', 'Escribe una afirmación, apóyala con evidencia y aborda una interpretación alternativa plausible.'],
    question: 'Does identifying a persuasive technique prove an argument is wrong?',
    questionEs: '¿Identificar una técnica persuasiva demuestra que un argumento está mal?',
    answer: 'No. Naming a technique is the start of analysis. Examine whether the evidence supports the conclusion, whether important context is missing and how another source treats the same claim. Explain the reasoning rather than applying a label alone.',
    answerEs: 'No. Nombrar una técnica es el comienzo del análisis. Examina si la evidencia apoya la conclusión, si falta contexto importante y cómo otra fuente trata la misma afirmación. Explica el razonamiento en lugar de limitarte a poner una etiqueta.'
  },
  'college-adult': {
    definition: 'The college and adult reading curriculum is a practice pathway for interpreting demanding texts, weighing sources and applying written information to a purpose. HeyGetOnMyLevel groups advanced vocabulary and critical comprehension activities here. Adults can choose another band for a particular task; the label describes practice content and does not define a person’s ability or qualifications.',
    definitionEs: 'El currículo de lectura universitario y para adultos es una ruta de práctica para interpretar textos exigentes, sopesar fuentes y aplicar la información escrita a un propósito. HeyGetOnMyLevel agrupa aquí actividades de vocabulario avanzado y comprensión crítica. Los adultos pueden elegir otra banda para una tarea concreta; la etiqueta describe el contenido de práctica y no define la capacidad ni las calificaciones de una persona.',
    task: 'Start with a public text connected to a real goal, such as a course description, policy explanation or research summary. Identify what decision the text informs and which details affect that decision. Keep personal records out of a practice passage. Summarize both what the source establishes and what remains uncertain before applying it elsewhere.',
    taskEs: 'Comienza con un texto público relacionado con un objetivo real, como la descripción de un curso, la explicación de una política o un resumen de investigación. Identifica qué decisión informa el texto y qué detalles afectan esa decisión. Mantén los datos personales fuera del texto de práctica. Resume tanto lo que la fuente establece como lo que queda incierto antes de aplicarla en otro contexto.',
    steps: ['Define the reading goal and inspect headings, authorship and publication context.', 'Distinguish a source’s reported finding from interpretation or recommendation.', 'Compare relevant sources and record any limitations that affect the conclusion.'],
    stepsEs: ['Define el objetivo de lectura y revisa los encabezados, la autoría y el contexto de publicación.', 'Distingue el hallazgo reportado por una fuente de la interpretación o la recomendación.', 'Compara las fuentes relevantes y anota las limitaciones que afectan la conclusión.'],
    question: 'Should an adult always choose the most advanced band?',
    questionEs: '¿Un adulto siempre debe elegir la banda más avanzada?',
    answer: 'Choose according to the task and the support you need. Familiarity with a subject, vocabulary and reading purpose can change how demanding a passage feels. A library literacy program or adult educator can help plan practice when independent work is frustrating.',
    answerEs: 'Elige según la tarea y el apoyo que necesites. La familiaridad con un tema, el vocabulario y el propósito de lectura pueden cambiar lo exigente que se siente un texto. Un programa de alfabetización de biblioteca o un educador de adultos puede ayudar a planificar la práctica cuando el trabajo independiente resulta frustrante.'
  }
};
