import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Homepage
  "home.stat": {
    en: "54% of U.S. adults",
    es: "54% de los adultos en EE.UU.",
  },
  "home.stat.suffix": {
    en: "read below a 6th-grade level.",
    es: "leen por debajo del nivel de 6to grado.",
  },
  "home.stat.extra": {
    en: "Reading struggles don't have to be permanent.",
    es: "Las dificultades de lectura no tienen que ser permanentes.",
  },
  "home.title.suffix": {
    en: "Whether you're 8 or 80, it's never too late to reach your reading potential. Build the skills you need — at your own pace, on your own terms.",
    es: "Ya tengas 8 u 80 años, nunca es tarde para alcanzar tu potencial de lectura. Desarrolla las habilidades que necesitas — a tu propio ritmo.",
  },
  "home.pill.noJudgment": { en: "No Judgment", es: "Sin Juicios" },
  "home.pill.findsLevel": { en: "Finds Your Level", es: "Encuentra Tu Nivel" },
  "home.pill.ages": { en: "Ages 5 to 85", es: "Edades 5 a 85" },
  "home.pill.track": { en: "Track Progress", es: "Sigue Tu Progreso" },
  "home.readingOpens": { en: "Reading opens doors", es: "La lectura abre puertas" },
  "home.forAdults": { en: "For adults:", es: "Para adultos:" },
  "home.forAdults.desc": {
    en: "Improve job applications, health literacy, and daily confidence",
    es: "Mejora solicitudes de empleo, comprensión de salud y confianza diaria",
  },
  "home.forStudents": { en: "For students:", es: "Para estudiantes:" },
  "home.forStudents.desc": {
    en: "Catch up to grade level with adaptive, judgment-free practice",
    es: "Alcanza tu nivel de grado con práctica adaptativa y sin juicios",
  },
  "home.forParents": { en: "For parents:", es: "Para padres:" },
  "home.forParents.desc": {
    en: "Help your child build foundational reading skills at home",
    es: "Ayuda a tu hijo a desarrollar habilidades fundamentales de lectura en casa",
  },
  "home.startReading": { en: "Start Reading Now", es: "Comenzar a Leer" },
  "home.assessMe": { en: "Assess My Level", es: "Evaluar Mi Nivel" },
  "home.noAccount": {
    en: "No account needed • Your progress stays private",
    es: "No necesitas cuenta • Tu progreso es privado",
  },
  "home.assessmentNote": {
    en: "📚 Assessment uses curated material • Reading sessions let you pick your topic",
    es: "📚 La evaluación usa material seleccionado • Las sesiones de lectura te permiten elegir tu tema",
  },
  "home.license": {
    en: "Free for personal & educational use. Commercial or institutional use requires a",
    es: "Gratis para uso personal y educativo. El uso comercial o institucional requiere una",
  },
  "home.licenseLink": { en: "license", es: "licencia" },

  // Select Level
  "selectLevel.title": { en: "Choose Your Level", es: "Elige Tu Nivel" },
  "selectLevel.subtitle": { en: "Select the grade level to practice", es: "Selecciona el nivel de grado para practicar" },
  "selectLevel.notSure": { en: "Not sure which level to choose?", es: "¿No sabes qué nivel elegir?" },
  "selectLevel.takeAssessment": { en: "Take the assessment", es: "Toma la evaluación" },
  "selectLevel.toFind": { en: "to find your level.", es: "para encontrar tu nivel." },

  // Level descriptions
  "level.grade": { en: "Grade", es: "Grado" },
  "level.college": { en: "College", es: "Universidad" },
  "level.1.desc": { en: "Basic words & short sentences", es: "Palabras básicas y oraciones cortas" },
  "level.2.desc": { en: "Simple stories & vocabulary", es: "Historias simples y vocabulario" },
  "level.3.desc": { en: "Longer sentences & new words", es: "Oraciones más largas y palabras nuevas" },
  "level.4.desc": { en: "Paragraphs & comprehension", es: "Párrafos y comprensión" },
  "level.5.desc": { en: "Complex ideas & inference", es: "Ideas complejas e inferencia" },
  "level.6.desc": { en: "Abstract concepts & analysis", es: "Conceptos abstractos y análisis" },
  "level.7.desc": { en: "Multi-paragraph analysis", es: "Análisis de múltiples párrafos" },
  "level.8.desc": { en: "Advanced comprehension", es: "Comprensión avanzada" },
  "level.9.desc": { en: "Literary analysis", es: "Análisis literario" },
  "level.10.desc": { en: "Critical thinking", es: "Pensamiento crítico" },
  "level.11.desc": { en: "Complex arguments", es: "Argumentos complejos" },
  "level.12.desc": { en: "College prep level", es: "Nivel preparatorio universitario" },
  "level.13.desc": { en: "Academic reading", es: "Lectura académica" },

  // Dashboard
  "dashboard.title": { en: "Learning Dashboard", es: "Panel de Aprendizaje" },
  "dashboard.pace": { en: "Practice at your own pace", es: "Practica a tu propio ritmo" },
  "dashboard.todaysLevel": { en: "Today's Level:", es: "Nivel de Hoy:" },
  "dashboard.basedAssessment": { en: "Based on your assessment", es: "Basado en tu evaluación" },
  "dashboard.youSelected": { en: "You selected this level", es: "Seleccionaste este nivel" },
  "dashboard.changeLevel": { en: "Change level", es: "Cambiar nivel" },
  "dashboard.whatRead": { en: "What do you want to read about?", es: "¿Sobre qué quieres leer?" },
  "dashboard.optional": { en: "Optional - leave blank for variety", es: "Opcional - deja en blanco para variedad" },
  "dashboard.placeholder": { en: "e.g., superheroes, space adventure, romance...", es: "ej., superhéroes, aventura espacial, romance..." },
  "dashboard.startSession": { en: "Start Reading Session", es: "Iniciar Sesión de Lectura" },
  "dashboard.practiceSkill": { en: "Practice a Specific Skill", es: "Practica una Habilidad Específica" },
  "dashboard.recommended": { en: "⭐ Recommended", es: "⭐ Recomendado" },
  "dashboard.thisSession": { en: "This Session", es: "Esta Sesión" },
  "dashboard.questions": { en: "Questions", es: "Preguntas" },
  "dashboard.accuracy": { en: "Accuracy", es: "Precisión" },

  // Skills
  "skill.phonics": { en: "Phonics", es: "Fonética" },
  "skill.phonics.desc": { en: "Learn letter sounds & blend them into words", es: "Aprende los sonidos de las letras y combínalos" },
  "skill.decoding": { en: "Decoding", es: "Decodificación" },
  "skill.decoding.desc": { en: "Breaking down words into parts", es: "Dividir palabras en partes" },
  "skill.vocabulary": { en: "Vocabulary", es: "Vocabulario" },
  "skill.vocabulary.desc": { en: "Understanding word meanings", es: "Comprender significados de palabras" },
  "skill.inference": { en: "Inference", es: "Inferencia" },
  "skill.inference.desc": { en: "Reading between the lines", es: "Leer entre líneas" },
  "skill.causeEffect": { en: "Cause & Effect", es: "Causa y Efecto" },
  "skill.causeEffect.desc": { en: "Understanding why things happen", es: "Entender por qué suceden las cosas" },
  "skill.reasoning": { en: "Multi-step Reasoning", es: "Razonamiento de Múltiples Pasos" },
  "skill.reasoning.desc": { en: "Following complex arguments", es: "Seguir argumentos complejos" },
  "skill.critical": { en: "Critical Thinking", es: "Pensamiento Crítico" },
  "skill.critical.desc": { en: "Analyzing and evaluating", es: "Analizar y evaluar" },
  "skill.comprehension": { en: "Comprehension", es: "Comprensión" },
  "skill.comprehension.desc": { en: "Understanding full passages", es: "Comprender pasajes completos" },

  // Session
  "session.title": { en: "Reading Session", es: "Sesión de Lectura" },
  "session.level": { en: "Level", es: "Nivel" },
  "session.creating": { en: "Creating your passage...", es: "Creando tu pasaje..." },
  "session.generating": { en: "Generating questions...", es: "Generando preguntas..." },
  "session.readingHelp": {
    en: "Take your time reading. Need help? Ask your AI Reading Buddy! When you're ready, tap the button below to answer questions.",
    es: "Tómate tu tiempo para leer. ¿Necesitas ayuda? ¡Pregúntale a tu Compañero de Lectura! Cuando estés listo, toca el botón de abajo para responder preguntas.",
  },
  "session.ready": { en: "I'm Ready for Questions", es: "Estoy Listo para las Preguntas" },
  "session.viewPassage": { en: "View passage again", es: "Ver el pasaje de nuevo" },
  "session.submitAnswer": { en: "Submit Answer", es: "Enviar Respuesta" },
  "session.nextQuestion": { en: "Next Question", es: "Siguiente Pregunta" },
  "session.viewResults": { en: "View Results", es: "Ver Resultados" },
  "session.greatJob": { en: "Great job!", es: "¡Buen trabajo!" },
  "session.notQuite": { en: "Not quite right", es: "No del todo correcto" },
  "session.passageComplete": { en: "Passage Complete!", es: "¡Pasaje Completado!" },
  "session.greatWork": { en: "Great work on this reading exercise", es: "Gran trabajo en este ejercicio de lectura" },
  "session.yourResults": { en: "Your Results", es: "Tus Resultados" },
  "session.correct": { en: "Correct", es: "Correcto" },
  "session.strengths": { en: "Your Strengths", es: "Tus Fortalezas" },
  "session.strengthsDesc": { en: "Great job! You're doing well with these skills:", es: "¡Buen trabajo! Te va bien con estas habilidades:" },
  "session.improve": { en: "Areas to Improve", es: "Áreas para Mejorar" },
  "session.improveDesc": { en: "Keep practicing these skills:", es: "Sigue practicando estas habilidades:" },
  "session.skillBreakdown": { en: "Skill Breakdown", es: "Desglose de Habilidades" },
  "session.continueLearning": { en: "Continue Learning", es: "Continuar Aprendiendo" },
  "session.endSession": { en: "End Session", es: "Terminar Sesión" },
  "session.levelUp": { en: "Level Up! Now at", es: "¡Subiste de Nivel! Ahora en" },
  "session.levelUpDesc": { en: "Great job! You're ready for harder passages.", es: "¡Buen trabajo! Estás listo para pasajes más difíciles." },
  "session.practiceMore": { en: "Let's practice more at", es: "Practiquemos más en" },
  "session.practiceMoreDesc": { en: "Keep going! Practice makes perfect.", es: "¡Sigue adelante! La práctica hace al maestro." },

  // Assessment
  "assessment.title": { en: "Reading Assessment", es: "Evaluación de Lectura" },
  "assessment.chooseType": { en: "Choose assessment type", es: "Elige el tipo de evaluación" },
  "assessment.vocabCheck": { en: "Vocabulary Check", es: "Verificación de Vocabulario" },
  "assessment.readAloud": { en: "Read Aloud", es: "Leer en Voz Alta" },
  "assessment.confirmLevel": { en: "Confirm Your Level", es: "Confirma Tu Nivel" },
  "assessment.complete": { en: "Assessment Complete", es: "Evaluación Completada" },
  "assessment.howAssess": { en: "How would you like to assess your reading?", es: "¿Cómo te gustaría evaluar tu lectura?" },
  "assessment.chooseMethod": { en: "Choose the assessment method that works best for you", es: "Elige el método de evaluación que mejor te funcione" },
  "assessment.quick30": { en: "Quick 30-second assessment – tap words you know", es: "Evaluación rápida de 30 segundos – toca las palabras que conoces" },
  "assessment.fastest": { en: "Fastest option", es: "Opción más rápida" },
  "assessment.readSentences": { en: "Read sentences out loud to test fluency & speed", es: "Lee oraciones en voz alta para evaluar fluidez y velocidad" },
  "assessment.requiresMic": { en: "Requires microphone", es: "Requiere micrófono" },
  "assessment.both": { en: "Both", es: "Ambos" },
  "assessment.recommended": { en: "Recommended", es: "Recomendado" },
  "assessment.comprehensive": { en: "Comprehensive assessment for the most accurate level", es: "Evaluación completa para el nivel más preciso" },
  "assessment.mostAccurate": { en: "Most accurate results", es: "Resultados más precisos" },
  "assessment.eslToggle": { en: "English is not my first language", es: "El inglés no es mi primer idioma" },
  "assessment.eslDesc": { en: "We'll adjust speed expectations to be more fair", es: "Ajustaremos las expectativas de velocidad para ser más justos" },
  "assessment.reassurance": {
    en: "Don't worry! Assessment passages are pre-selected to measure your level accurately. Once complete, you'll choose topics that interest you for reading practice.",
    es: "¡No te preocupes! Los pasajes de evaluación están preseleccionados para medir tu nivel con precisión. Una vez completado, elegirás temas que te interesen para practicar.",
  },
  "assessment.confirmTitle": { en: "Let's confirm your level", es: "Confirmemos tu nivel" },
  "assessment.confirmDesc": { en: "Read this short passage and answer the questions", es: "Lee este pasaje corto y responde las preguntas" },
  "assessment.preparing": { en: "Preparing confirmation passage...", es: "Preparando pasaje de confirmación..." },
  "assessment.questionOf": { en: "Question", es: "Pregunta" },
  "assessment.of": { en: "of", es: "de" },
  "assessment.correct": { en: "Correct!", es: "¡Correcto!" },
  "assessment.notQuiteRight": { en: "Not quite right", es: "No del todo correcto" },
  "assessment.seeResults": { en: "See Results", es: "Ver Resultados" },
  "assessment.yourLevel": { en: "Your reading level is", es: "Tu nivel de lectura es" },
  "assessment.foundLevel": { en: "Based on your assessment, we've found the perfect level for you to practice.", es: "Basado en tu evaluación, encontramos el nivel perfecto para que practiques." },
  "assessment.summary": { en: "Assessment Summary", es: "Resumen de Evaluación" },
  "assessment.vocabLevel": { en: "Vocabulary Level", es: "Nivel de Vocabulario" },
  "assessment.readingAccuracy": { en: "Reading Accuracy", es: "Precisión de Lectura" },
  "assessment.readingSpeed": { en: "Reading Speed", es: "Velocidad de Lectura" },
  "assessment.confirmScore": { en: "Confirmation Score", es: "Puntuación de Confirmación" },
  "assessment.startLearning": { en: "Start Learning at Grade", es: "Comenzar a Aprender en Grado" },

  // Summary
  "summary.complete": { en: "Session Complete!", es: "¡Sesión Completada!" },
  "summary.outstanding": { en: "Outstanding work! You're really getting the hang of this!", es: "¡Trabajo excepcional! ¡Realmente estás dominando esto!" },
  "summary.great": { en: "Great progress! Keep practicing to improve even more.", es: "¡Gran progreso! Sigue practicando para mejorar aún más." },
  "summary.nice": { en: "Nice effort! Every question helps you learn.", es: "¡Buen esfuerzo! Cada pregunta te ayuda a aprender." },
  "summary.good": { en: "Good start! Reading takes practice, and you're on your way.", es: "¡Buen comienzo! La lectura toma práctica, y vas por buen camino." },
  "summary.levelPracticed": { en: "Level Practiced", es: "Nivel Practicado" },
  "summary.questionsAnswered": { en: "Questions Answered", es: "Preguntas Respondidas" },
  "summary.correctAnswers": { en: "Correct Answers", es: "Respuestas Correctas" },
  "summary.overallAccuracy": { en: "Overall Accuracy", es: "Precisión General" },
  "summary.skillsPracticed": { en: "Skills Practiced", es: "Habilidades Practicadas" },
  "summary.startNew": { en: "Start New Session", es: "Iniciar Nueva Sesión" },
  "summary.privacy": { en: "Your session data has been cleared. We don't store any personal information.", es: "Los datos de tu sesión han sido eliminados. No almacenamos información personal." },

  // Footer
  "footer.rights": { en: "All rights reserved.", es: "Todos los derechos reservados." },
  "footer.personal": { en: "Free for personal use. Commercial use requires a", es: "Gratis para uso personal. El uso comercial requiere una" },
  "footer.license": { en: "license", es: "licencia" },
  "footer.privacy": { en: "Privacy Policy", es: "Política de Privacidad" },
  "footer.terms": { en: "Terms of Service", es: "Términos de Servicio" },

  // Feedback
  "feedback.title": { en: "Send Feedback", es: "Enviar Comentarios" },
  "feedback.bug": { en: "🐛 Bug Report", es: "🐛 Reporte de Error" },
  "feedback.feature": { en: "💡 Feature Request", es: "💡 Solicitud de Función" },
  "feedback.general": { en: "💬 General Feedback", es: "💬 Comentarios Generales" },
  "feedback.noPersonal": { en: "Please don't include personal info (name, email, location)", es: "Por favor no incluyas información personal (nombre, correo, ubicación)" },
  "feedback.placeholder": { en: "Tell us what you think...", es: "Cuéntanos qué piensas..." },
  "feedback.characters": { en: "characters", es: "caracteres" },
  "feedback.send": { en: "Send Feedback", es: "Enviar Comentarios" },
  "feedback.sending": { en: "Sending...", es: "Enviando..." },
  "feedback.sent": { en: "Feedback sent!", es: "¡Comentarios enviados!" },
  "feedback.thanks": { en: "Thank you for your feedback.", es: "Gracias por tus comentarios." },
  "feedback.enterMessage": { en: "Please enter a message", es: "Por favor ingresa un mensaje" },
  "feedback.failed": { en: "Failed to send feedback", es: "No se pudieron enviar los comentarios" },
  "feedback.tryAgain": { en: "Please try again later.", es: "Por favor intenta de nuevo más tarde." },

  // AI Tutor
  "tutor.welcome1": { en: "Hi there! 👋 I'm your Reading Buddy!", es: "¡Hola! 👋 ¡Soy tu Compañero de Lectura!" },
  "tutor.welcome2": {
    en: "Here's how I work:\n\nI'm here to help you on your reading journey! You will read the passage on the screen first, and then press the big green \"I'm Ready for Questions\" button when you've finished.",
    es: "Así es como funciono:\n\n¡Estoy aquí para ayudarte en tu camino de lectura! Primero lee el pasaje en la pantalla, y luego presiona el gran botón verde \"Estoy Listo para las Preguntas\" cuando hayas terminado.",
  },
  "tutor.welcome3": {
    en: "📱 On a phone or tablet, tap the \"✕\" button to close me and start reading. Tap the little robot icon 🤖 at the top of the screen to find me again.\n\nYou can stop me talking anytime by pressing the small stop icon while I'm speaking.",
    es: "📱 En un teléfono o tablet, toca el botón \"✕\" para cerrarme y empezar a leer. Toca el ícono del robot 🤖 en la parte superior de la pantalla para encontrarme de nuevo.\n\nPuedes detenerme en cualquier momento presionando el ícono de parar mientras hablo.",
  },
  "tutor.welcome4": {
    en: "💻 On a computer, I'll be right here beside your passage. You can type questions to me or use the quick buttons below.\n\nYou can also tap any word in the passage to hear how it sounds!",
    es: "💻 En una computadora, estaré aquí al lado de tu pasaje. Puedes escribirme preguntas o usar los botones rápidos de abajo.\n\n¡También puedes tocar cualquier palabra del pasaje para escuchar cómo suena!",
  },
  "tutor.welcome5": {
    en: "Take your time reading — there's no rush! I'm here whenever you need me. 📚\n\nBefore we start, what's your name? (Or what would you like me to call you?)",
    es: "Tómate tu tiempo para leer — ¡no hay prisa! Estoy aquí cuando me necesites. 📚\n\n¿Cómo te llamas? (¿O cómo te gustaría que te llame?)",
  },
  "tutor.placeholder": { en: "Ask your Reading Buddy...", es: "Pregúntale a tu Compañero de Lectura..." },
  "tutor.limitReached": { en: "Message limit reached for this passage", es: "Límite de mensajes alcanzado para este pasaje" },

  // Vocabulary Assessment
  "vocab.title": { en: "Quick Vocabulary Check", es: "Verificación Rápida de Vocabulario" },
  "vocab.subtitle": { en: "Tap all the words you know and understand. Be honest – this helps us find the right level for you!", es: "Toca todas las palabras que conoces y entiendes. Sé honesto — ¡esto nos ayuda a encontrar el nivel correcto para ti!" },
  "vocab.selected": { en: "Words selected", es: "Palabras seleccionadas" },
  "vocab.tip": { en: "Only select words you're confident you know. It's okay if you don't know all of them!", es: "Solo selecciona palabras que estés seguro de conocer. ¡Está bien si no las conoces todas!" },
  "vocab.tip.label": { en: "Tip:", es: "Consejo:" },
  "vocab.submit": { en: "Find My Reading Level", es: "Encontrar Mi Nivel de Lectura" },
  "vocab.analyzing": { en: "Analyzing...", es: "Analizando..." },

  // Reading hints
  "hint.recall.1": { en: "Look for the answer stated directly in the passage.", es: "Busca la respuesta declarada directamente en el pasaje." },
  "hint.recall.2": { en: "Scan for names, dates, or specific details mentioned.", es: "Busca nombres, fechas o detalles específicos mencionados." },
  "hint.recall.3": { en: "The answer is usually word-for-word in the text!", es: "¡La respuesta generalmente está palabra por palabra en el texto!" },
  "hint.inference.1": { en: "Think about what the author is suggesting but not saying directly.", es: "Piensa en lo que el autor sugiere pero no dice directamente." },
  "hint.inference.2": { en: "Ask yourself: 'What can I figure out from the clues?'", es: "Pregúntate: '¿Qué puedo deducir de las pistas?'" },
  "hint.inference.3": { en: "Combine details from the passage to draw a conclusion.", es: "Combina detalles del pasaje para sacar una conclusión." },
  "hint.vocabulary.1": { en: "Look at the words around it for context clues.", es: "Mira las palabras alrededor para encontrar pistas de contexto." },
  "hint.vocabulary.2": { en: "Think about word parts - prefixes, suffixes, root words.", es: "Piensa en las partes de la palabra - prefijos, sufijos, raíces." },
  "hint.vocabulary.3": { en: "Try replacing the word with each answer choice to see what fits.", es: "Intenta reemplazar la palabra con cada opción para ver cuál encaja." },
  "hint.general.1": { en: "Read the question twice to make sure you understand it.", es: "Lee la pregunta dos veces para asegurarte de que la entiendes." },
  "hint.general.2": { en: "Go back to the passage and find the relevant paragraph.", es: "Vuelve al pasaje y encuentra el párrafo relevante." },
  "hint.general.3": { en: "Eliminate answers that are clearly wrong first.", es: "Elimina primero las respuestas que claramente son incorrectas." },

  // Footer
  "footer.curriculum": { en: "Curriculum", es: "Currículo" },
  "footer.downloadCurriculum": { en: "Download Curriculum Map", es: "Descargar Mapa Curricular" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("app_language") as Language) || "en";
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || translations[key]?.["en"] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
