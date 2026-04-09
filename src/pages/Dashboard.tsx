import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Link2, 
  Search, 
  Sparkles, 
  MessageSquare,
  Play,
  ArrowLeft,
  Palette,
  Volume2
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";

import skillPhonics from "@/assets/skill-phonics.png";
import skillDecoding from "@/assets/skill-decoding.png";
import skillVocabulary from "@/assets/skill-vocabulary.png";
import skillInference from "@/assets/skill-inference.png";
import skillCauseEffect from "@/assets/skill-cause-effect.png";
import skillReasoning from "@/assets/skill-reasoning.png";
import skillCritical from "@/assets/skill-critical.png";
import skillComprehension from "@/assets/skill-comprehension.png";

interface Skill {
  id: string;
  nameKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  image: string;
  featured?: boolean;
}

const skills: Skill[] = [
  {
    id: "phonics",
    nameKey: "skill.phonics",
    descKey: "skill.phonics.desc",
    icon: Volume2,
    color: "bg-secondary/10 text-secondary",
    image: skillPhonics,
    featured: true,
  },
  {
    id: "decoding",
    nameKey: "skill.decoding",
    descKey: "skill.decoding.desc",
    icon: Search,
    color: "bg-primary/10 text-primary",
    image: skillDecoding,
  },
  {
    id: "vocabulary",
    nameKey: "skill.vocabulary",
    descKey: "skill.vocabulary.desc",
    icon: BookOpen,
    color: "bg-secondary/10 text-secondary",
    image: skillVocabulary,
  },
  {
    id: "inference",
    nameKey: "skill.inference",
    descKey: "skill.inference.desc",
    icon: Lightbulb,
    color: "bg-accent/20 text-accent-foreground",
    image: skillInference,
  },
  {
    id: "cause_effect",
    nameKey: "skill.causeEffect",
    descKey: "skill.causeEffect.desc",
    icon: Link2,
    color: "bg-success/10 text-success",
    image: skillCauseEffect,
  },
  {
    id: "reasoning",
    nameKey: "skill.reasoning",
    descKey: "skill.reasoning.desc",
    icon: Brain,
    color: "bg-primary/10 text-primary",
    image: skillReasoning,
  },
  {
    id: "critical",
    nameKey: "skill.critical",
    descKey: "skill.critical.desc",
    icon: Sparkles,
    color: "bg-secondary/10 text-secondary",
    image: skillCritical,
  },
  {
    id: "comprehension",
    nameKey: "skill.comprehension",
    descKey: "skill.comprehension.desc",
    icon: MessageSquare,
    color: "bg-accent/20 text-accent-foreground",
    image: skillComprehension,
  },
];

// Theme suggestions by grade level
const getThemeSuggestions = (level: number, language: string): string[] => {
  if (language === "es") {
    if (level <= 6) {
      return ["Superhéroes", "Dinosaurios", "Espacio", "Animales", "Piratas", "Deportes"];
    } else if (level <= 12) {
      return ["Fantasía", "Misterio", "Deportes", "Música", "Aventura", "Ciencia"];
    }
    return ["Ficción Histórica", "Romance", "Tecnología", "Negocios", "Viajes", "Filosofía"];
  }
  if (level <= 6) {
    return ["Superheroes", "Dinosaurs", "Space", "Animals", "Pirates", "Sports"];
  } else if (level <= 12) {
    return ["Fantasy", "Mystery", "Sports", "Music", "Adventure", "Science"];
  }
  return ["Historical Fiction", "Romance", "Technology", "Business", "Travel", "Philosophy"];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { t, language } = useLanguage();
  const [theme, setTheme] = useState("");

  if (!session || !session.readingLevel) {
    navigate("/");
    return null;
  }

  const handleStartSession = (skillFocus?: string) => {
    if (skillFocus === "phonics") {
      navigate("/phonics");
      return;
    }
    navigate("/session", { state: { skillFocus, theme: theme.trim() || undefined } });
  };

  const themeSuggestions = getThemeSuggestions(session.readingLevel, language);

  const gradeLabel =
    session.readingLevel <= 12
      ? `${t("level.grade")} ${session.readingLevel}`
      : t("level.college");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">{t("dashboard.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.pace")}
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6 space-y-8">
        {/* Level Card */}
        <div className="card-elevated text-center fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl font-display font-bold text-primary">
              {session.readingLevel <= 12 ? session.readingLevel : "C"}
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold">{t("dashboard.todaysLevel")} {gradeLabel}</h2>
          <p className="text-muted-foreground mt-1">
            {session.assessmentTaken
              ? t("dashboard.basedAssessment")
              : t("dashboard.youSelected")}
          </p>
          <button
            onClick={() => navigate("/select-level")}
            className="text-sm text-primary font-medium mt-3 hover:underline"
          >
            {t("dashboard.changeLevel")}
          </button>
        </div>

        {/* Theme Selection */}
        <div className="card-elevated fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold">{t("dashboard.whatRead")}</h3>
              <p className="text-sm text-muted-foreground">{t("dashboard.optional")}</p>
            </div>
          </div>
          <Input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={t("dashboard.placeholder")}
            className="mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {themeSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setTheme(suggestion)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  theme === suggestion
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Start Session CTA */}
        <button
          onClick={() => handleStartSession()}
          className="btn-hero w-full flex items-center justify-center gap-3 fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <Play className="w-6 h-6" />
          <span>{t("dashboard.startSession")}</span>
        </button>

        {/* Skills Section */}
        <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-lg font-display font-bold mb-4">{t("dashboard.practiceSkill")}</h3>
          
          {/* Featured Phonics Card */}
          {skills.filter(s => s.featured).map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleStartSession(skill.id)}
              className="w-full card-elevated text-left hover:ring-2 hover:ring-secondary/50 transition-all mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={skill.image} 
                  alt={t(skill.nameKey)} 
                  className="w-20 h-20 object-contain flex-shrink-0" 
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{t("dashboard.recommended")}</span>
                  </div>
                  <p className="font-display font-bold text-lg text-foreground">{t(skill.nameKey)}</p>
                  <p className="text-sm text-muted-foreground">{t(skill.descKey)}</p>
                </div>
              </div>
            </button>
          ))}

          {/* Other Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.filter(s => !s.featured).map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleStartSession(skill.id)}
                className="card-elevated text-left hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={skill.image} 
                    alt={t(skill.nameKey)} 
                    className="w-14 h-14 object-contain flex-shrink-0" 
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t(skill.nameKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(skill.descKey)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Stats (if any) */}
        {session.questionsAnswered > 0 && (
          <div className="card-elevated fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-display font-bold mb-4">{t("dashboard.thisSession")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">
                  {session.questionsAnswered}
                </p>
                <p className="text-sm text-muted-foreground">{t("dashboard.questions")}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-success/10">
                <p className="text-2xl font-bold text-success">
                  {Math.round((session.correctAnswers / session.questionsAnswered) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">{t("dashboard.accuracy")}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
