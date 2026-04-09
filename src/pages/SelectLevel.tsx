import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import Footer from "@/components/Footer";

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

  const handleSelectLevel = async (grade: number) => {
    setSelectedLevel(grade);
    setIsLoading(true);
    try {
      await updateReadingLevel(grade);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update level:", error);
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
