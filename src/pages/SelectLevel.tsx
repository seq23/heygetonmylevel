import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Brain,
  Lightbulb,
  Link2,
  Search,
  Sparkles,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
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
  image: string;
  featured?: boolean;
}

const skills: Skill[] = [
  { id: "phonics", nameKey: "skill.phonics", descKey: "skill.phonics.desc", icon: Volume2, image: skillPhonics, featured: true },
  { id: "decoding", nameKey: "skill.decoding", descKey: "skill.decoding.desc", icon: Search, image: skillDecoding },
  { id: "vocabulary", nameKey: "skill.vocabulary", descKey: "skill.vocabulary.desc", icon: BookOpen, image: skillVocabulary },
  { id: "inference", nameKey: "skill.inference", descKey: "skill.inference.desc", icon: Lightbulb, image: skillInference },
  { id: "cause_effect", nameKey: "skill.causeEffect", descKey: "skill.causeEffect.desc", icon: Link2, image: skillCauseEffect },
  { id: "reasoning", nameKey: "skill.reasoning", descKey: "skill.reasoning.desc", icon: Brain, image: skillReasoning },
  { id: "critical", nameKey: "skill.critical", descKey: "skill.critical.desc", icon: Sparkles, image: skillCritical },
  { id: "comprehension", nameKey: "skill.comprehension", descKey: "skill.comprehension.desc", icon: MessageSquare, image: skillComprehension },
];

const SelectLevel = () => {
  const navigate = useNavigate();
  const { session, updateReadingLevel } = useSession();
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const levels = Array.from({ length: 13 }, (_, i) => ({
    grade: i + 1,
    label: i + 1 <= 12 ? `${t("level.grade")} ${i + 1}` : t("level.college"),
    description: t(`level.${i + 1}.desc`),
  }));

  const handleSelectLevel = (grade: number) => {
    setSelectedLevel(grade);
    // Smoothly scroll to skills so the user sees the next step
    setTimeout(() => {
      document
        .getElementById("skill-picker")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleContinue = async () => {
    if (!selectedLevel) return;
    setIsLoading(true);
    try {
      await updateReadingLevel(selectedLevel);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSkill = async (skillId: string) => {
    if (!selectedLevel) return;
    setIsLoading(true);
    try {
      await updateReadingLevel(selectedLevel);
      if (skillId === "phonics") {
        navigate("/phonics");
      } else {
        navigate("/session", { state: { skillFocus: skillId } });
      }
    } catch (error) {
      console.error("Failed to start skill session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">{t("selectLevel.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("selectLevel.subtitle")}</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container max-w-4xl py-8 px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {levels.map((level) => (
            <button
              key={level.grade}
              onClick={() => handleSelectLevel(level.grade)}
              disabled={isLoading}
              className={`card-elevated text-left transition-all duration-200 ${
                selectedLevel === level.grade
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:ring-2 hover:ring-primary/50"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex flex-col gap-3">
                <div
                  className={`level-badge ${
                    level.grade <= 4
                      ? "bg-success/10 text-success"
                      : level.grade <= 8
                      ? "bg-primary/10 text-primary"
                      : level.grade <= 12
                      ? "bg-secondary/10 text-secondary"
                      : "bg-accent/20 text-accent-foreground"
                  }`}
                >
                  {level.grade <= 12 ? level.grade : <GraduationCap className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{level.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue button (visible once a level is picked) */}
        {selectedLevel && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="btn-hero px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : `${t("dashboard.startSession")} →`}
            </button>
          </div>
        )}

        {/* Skill picker — same content as the dashboard hub */}
        <div id="skill-picker" className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-display font-bold">
              {t("dashboard.practiceSkill")}
            </h2>
            {!selectedLevel && (
              <p className="text-xs text-muted-foreground">
                ↑ {t("selectLevel.subtitle")}
              </p>
            )}
          </div>

          {/* Featured (Phonics) */}
          {skills
            .filter((s) => s.featured)
            .map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSelectSkill(skill.id)}
                disabled={!selectedLevel || isLoading}
                className={`w-full card-elevated text-left mb-6 transition-all ${
                  !selectedLevel || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:ring-2 hover:ring-secondary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={skill.image}
                    alt={t(skill.nameKey)}
                    className="w-20 h-20 object-contain flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                      {t("dashboard.recommended")}
                    </span>
                    <p className="font-display font-bold text-lg text-foreground">
                      {t(skill.nameKey)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(skill.descKey)}
                    </p>
                  </div>
                </div>
              </button>
            ))}

          {/* Other skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills
              .filter((s) => !s.featured)
              .map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSelectSkill(skill.id)}
                  disabled={!selectedLevel || isLoading}
                  className={`card-elevated text-left transition-all ${
                    !selectedLevel || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={skill.image}
                      alt={t(skill.nameKey)}
                      className="w-14 h-14 object-contain flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {t(skill.nameKey)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(skill.descKey)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-muted/50 text-center">
          <p className="text-muted-foreground">
            {t("selectLevel.notSure")}{" "}
            <button
              onClick={() => navigate("/assessment")}
              className="text-primary font-semibold hover:underline"
            >
              {t("selectLevel.takeAssessment")}
            </button>{" "}
            {t("selectLevel.toFind")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SelectLevel;
