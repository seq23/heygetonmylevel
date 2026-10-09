export interface Module {
  num: number;
  title: string;
  titleEs: string;
  hours: number;
  skills: string;
  skillsEs: string;
  desc: string;
  descEs: string;
}

export interface GradeBand {
  slug: string;
  band: string;
  bandEs: string;
  grades: number[];
  modules: Module[];
}

export const gradeBands: GradeBand[] = [
  {
    slug: "early-elementary",
    band: "Early Elementary",
    bandEs: "Primaria Temprana",
    grades: [1, 2],
    modules: [
      { num: 1, title: "Sound It Out", titleEs: "Pronúncialo", hours: 10, skills: "Phonics, Decoding", skillsEs: "Fonética, Decodificación", desc: "Letter-sound relationships, CVC words, blending, segmenting.", descEs: "Relaciones letra-sonido, palabras CVC, mezcla, segmentación." },
      { num: 2, title: "Word Power", titleEs: "Poder de Palabras", hours: 10, skills: "Vocabulary, Comprehension", skillsEs: "Vocabulario, Comprensión", desc: "Sight words, high-frequency words, simple story comprehension.", descEs: "Palabras de vista, palabras frecuentes, comprensión de historias simples." },
      { num: 3, title: "Story Time", titleEs: "Hora del Cuento", hours: 10, skills: "Inference, Cause & Effect", skillsEs: "Inferencia, Causa y Efecto", desc: "Making predictions, identifying story sequence, understanding why things happen.", descEs: "Hacer predicciones, identificar secuencia, entender por qué suceden las cosas." },
      { num: 4, title: "Think About It", titleEs: "Piénsalo", hours: 10, skills: "Reasoning, Critical Thinking", skillsEs: "Razonamiento, Pensamiento Crítico", desc: "Comparing characters, identifying main idea, forming opinions.", descEs: "Comparar personajes, identificar idea principal, formar opiniones." },
    ],
  },
  {
    slug: "upper-elementary",
    band: "Upper Elementary",
    bandEs: "Primaria Superior",
    grades: [3, 4, 5],
    modules: [
      { num: 1, title: "Decode & Discover", titleEs: "Decodifica y Descubre", hours: 10, skills: "Phonics, Decoding", skillsEs: "Fonética, Decodificación", desc: "Multi-syllable words, prefixes/suffixes, fluency building.", descEs: "Palabras multisilábicas, prefijos/sufijos, desarrollo de fluidez." },
      { num: 2, title: "Words in the Wild", titleEs: "Palabras en Contexto", hours: 10, skills: "Vocabulary, Comprehension", skillsEs: "Vocabulario, Comprensión", desc: "Academic vocabulary, context clues, reading informational texts.", descEs: "Vocabulario académico, pistas de contexto, lectura de textos informativos." },
      { num: 3, title: "Read Between the Lines", titleEs: "Lee Entre Líneas", hours: 10, skills: "Inference, Cause & Effect", skillsEs: "Inferencia, Causa y Efecto", desc: "Drawing conclusions, identifying themes, cause-effect in paragraphs.", descEs: "Sacar conclusiones, identificar temas, causa-efecto en párrafos." },
      { num: 4, title: "Deep Thinking", titleEs: "Pensamiento Profundo", hours: 10, skills: "Reasoning, Critical Thinking", skillsEs: "Razonamiento, Pensamiento Crítico", desc: "Author's purpose, fact vs. opinion, supporting arguments with evidence.", descEs: "Propósito del autor, hecho vs. opinión, apoyar argumentos con evidencia." },
    ],
  },
  {
    slug: "middle-school",
    band: "Middle School",
    bandEs: "Escuela Intermedia",
    grades: [6, 7, 8],
    modules: [
      { num: 1, title: "Word Mastery", titleEs: "Dominio de Palabras", hours: 10, skills: "Vocabulary, Decoding", skillsEs: "Vocabulario, Decodificación", desc: "Greek/Latin roots, domain-specific vocabulary, complex word analysis.", descEs: "Raíces griegas/latinas, vocabulario específico, análisis de palabras complejas." },
      { num: 2, title: "Comprehension Deep Dive", titleEs: "Comprensión Profunda", hours: 10, skills: "Comprehension, Inference", skillsEs: "Comprensión, Inferencia", desc: "Analyzing complex narratives, implicit themes, cross-paragraph inference.", descEs: "Analizar narrativas complejas, temas implícitos, inferencia entre párrafos." },
      { num: 3, title: "Critical Analysis", titleEs: "Análisis Crítico", hours: 10, skills: "Cause & Effect, Reasoning", skillsEs: "Causa y Efecto, Razonamiento", desc: "Analyzing arguments, identifying bias, complex cause-effect relationships.", descEs: "Analizar argumentos, identificar sesgo, relaciones complejas de causa-efecto." },
      { num: 4, title: "Advanced Reasoning", titleEs: "Razonamiento Avanzado", hours: 10, skills: "Critical Thinking, Comprehension", skillsEs: "Pensamiento Crítico, Comprensión", desc: "Evaluating sources, synthesizing texts, evidence-based conclusions.", descEs: "Evaluar fuentes, sintetizar textos, conclusiones basadas en evidencia." },
    ],
  },
  {
    slug: "high-school",
    band: "High School",
    bandEs: "Preparatoria",
    grades: [9, 10, 11, 12],
    modules: [
      { num: 1, title: "Academic Language", titleEs: "Lenguaje Académico", hours: 10, skills: "Vocabulary, Decoding", skillsEs: "Vocabulario, Decodificación", desc: "SAT/ACT-level vocabulary, discipline-specific terms, nuanced word usage.", descEs: "Vocabulario nivel SAT/ACT, términos específicos, uso matizado de palabras." },
      { num: 2, title: "Literary Analysis", titleEs: "Análisis Literario", hours: 10, skills: "Comprehension, Inference", skillsEs: "Comprensión, Inferencia", desc: "Literary devices, symbolism, unreliable narrators, subtext.", descEs: "Dispositivos literarios, simbolismo, narradores poco fiables, subtexto." },
      { num: 3, title: "Argument & Rhetoric", titleEs: "Argumento y Retórica", hours: 10, skills: "Reasoning, Critical Thinking", skillsEs: "Razonamiento, Pensamiento Crítico", desc: "Rhetorical strategies, logical fallacies, counter-arguments.", descEs: "Estrategias retóricas, falacias lógicas, contraargumentos." },
      { num: 4, title: "Synthesis & Evaluation", titleEs: "Síntesis y Evaluación", hours: 10, skills: "Cause & Effect, Comprehension", skillsEs: "Causa y Efecto, Comprensión", desc: "Multi-source synthesis, credibility evaluation, original interpretations.", descEs: "Síntesis de múltiples fuentes, evaluación de credibilidad, interpretaciones originales." },
    ],
  },
  {
    slug: "college-adult",
    band: "College / Adult",
    bandEs: "Universidad / Adulto",
    grades: [13],
    modules: [
      { num: 1, title: "Professional Vocabulary", titleEs: "Vocabulario Profesional", hours: 10, skills: "Vocabulary, Comprehension", skillsEs: "Vocabulario, Comprensión", desc: "Workplace vocabulary, legal/medical/financial literacy.", descEs: "Vocabulario laboral, alfabetización legal/médica/financiera." },
      { num: 2, title: "Critical Reading", titleEs: "Lectura Crítica", hours: 10, skills: "Inference, Critical Thinking", skillsEs: "Inferencia, Pensamiento Crítico", desc: "Opinion pieces, research papers, identifying assumptions and bias.", descEs: "Artículos de opinión, trabajos de investigación, identificar suposiciones y sesgo." },
      { num: 3, title: "Advanced Analysis", titleEs: "Análisis Avanzado", hours: 10, skills: "Reasoning, Cause & Effect", skillsEs: "Razonamiento, Causa y Efecto", desc: "Complex argumentation, philosophical reasoning, systemic analysis.", descEs: "Argumentación compleja, razonamiento filosófico, análisis sistémico." },
      { num: 4, title: "Mastery & Application", titleEs: "Dominio y Aplicación", hours: 10, skills: "All Skills", skillsEs: "Todas las Habilidades", desc: "Integrating all reading skills. Real-world application across domains.", descEs: "Integrar todas las habilidades de lectura. Aplicación en el mundo real." },
    ],
  },
];

export const findBand = (slug: string | undefined): GradeBand | undefined =>
  gradeBands.find((gb) => gb.slug === slug);
