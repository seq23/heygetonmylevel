import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, BookOpen, Clock, CheckCircle } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Module {
  num: number;
  title: string;
  titleEs: string;
  hours: number;
  skills: string;
  skillsEs: string;
  desc: string;
  descEs: string;
}

interface GradeBand {
  band: string;
  bandEs: string;
  grades: number[];
  modules: Module[];
}

const gradeBands: GradeBand[] = [
  {
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

const Curriculum = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { t, language } = useLanguage();
  const isEs = language === "es";

  const userLevel = session?.readingLevel;

  const getUserBand = () => {
    if (!userLevel) return null;
    return gradeBands.find((gb) => gb.grades.includes(userLevel));
  };

  const currentBand = getUserBand();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Reading Curriculum Map — HeyGetOnMyLevel"
        description="200-hour reading curriculum across 5 grade bands and 20 modules. Phonics to critical thinking, K through college."
        path="/curriculum"
      />
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-5xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">
              {isEs ? "Mapa Curricular" : "Curriculum Map"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEs
                ? "200 horas de instrucción en 20 módulos"
                : "200 hours of instruction across 20 modules"}
            </p>
          </div>
          <a
            href="/HeyGetOnMyLevel_Curriculum_Map.docx"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            {isEs ? "Descargar .docx" : "Download .docx"}
          </a>
        </div>
      </header>

      <main id="main-content" className="container max-w-5xl py-8 px-6 space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-in-up">
          {[
            { label: isEs ? "Bandas de Grado" : "Grade Bands", value: "5" },
            { label: isEs ? "Módulos" : "Modules", value: "20" },
            { label: isEs ? "Horas Totales" : "Total Hours", value: "200" },
            { label: isEs ? "Habilidades" : "Skills Covered", value: "8" },
          ].map((stat) => (
            <div key={stat.label} className="card-elevated text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Current level highlight */}
        {currentBand && (
          <div className="card-elevated border-2 border-primary/30 fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold">
                  {isEs ? "Tu nivel actual:" : "Your current level:"}{" "}
                  {isEs ? currentBand.bandEs : currentBand.band}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEs
                    ? "Los módulos resaltados abajo corresponden a tu nivel"
                    : "Highlighted modules below match your level"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grade bands */}
        {gradeBands.map((gb, idx) => {
          const isCurrentBand = currentBand === gb;
          return (
            <div
              key={gb.band}
              className={`fade-in-up ${isCurrentBand ? "ring-2 ring-primary/30 rounded-2xl" : ""}`}
              style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
            >
              <div className="card-elevated">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isCurrentBand ? "bg-primary/10" : "bg-muted"}`}>
                    <BookOpen className={`w-5 h-5 ${isCurrentBand ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold">
                      {isEs ? gb.bandEs : gb.band}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isEs ? "Grados" : "Grades"} {gb.grades.join(", ")} — 4{" "}
                      {isEs ? "módulos" : "modules"} • 40{" "}
                      {isEs ? "horas" : "hours"}
                    </p>
                  </div>
                  {isCurrentBand && (
                    <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {isEs ? "Tu nivel" : "Your level"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gb.modules.map((mod) => (
                    <div
                      key={mod.num}
                      className="p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">
                          {mod.num}
                        </span>
                        <h3 className="font-semibold text-sm">
                          {isEs ? mod.titleEs : mod.title}
                        </h3>
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {mod.hours}h
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {isEs ? mod.descEs : mod.desc}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(isEs ? mod.skillsEs : mod.skills).split(", ").map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
};

export default Curriculum;
