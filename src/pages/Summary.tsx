import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, BookOpen, Target, Star, ArrowRight } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";

const Summary = () => {
  const navigate = useNavigate();
  const { session, endSession } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    return () => {};
  }, []);

  const handleStartNewSession = async () => {
    await endSession();
    navigate("/");
  };

  if (!session) {
    navigate("/");
    return null;
  }

  const accuracy =
    session.questionsAnswered > 0
      ? Math.round((session.correctAnswers / session.questionsAnswered) * 100)
      : 0;

  const gradeLabel =
    session.readingLevel && session.readingLevel <= 12
      ? `${t("level.grade")} ${session.readingLevel}`
      : t("level.college");

  const encouragementMessage = () => {
    if (accuracy >= 80) return t("summary.outstanding");
    if (accuracy >= 60) return t("summary.great");
    if (accuracy >= 40) return t("summary.nice");
    return t("summary.good");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8 fade-in-up">
        <div className="celebration-bounce">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-accent/20 mb-4">
            <Trophy className="w-14 h-14 text-accent-foreground" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-display font-bold">{t("summary.complete")}</h1>
          <p className="text-muted-foreground mt-2">{encouragementMessage()}</p>
        </div>

        <div className="card-elevated space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">{t("summary.levelPracticed")}</span>
            </div>
            <span className="font-bold text-foreground">{gradeLabel}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-muted-foreground">{t("summary.questionsAnswered")}</span>
            </div>
            <span className="font-bold text-foreground">{session.questionsAnswered}</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <Star className="w-5 h-5 text-success" />
              </div>
              <span className="text-muted-foreground">{t("summary.correctAnswers")}</span>
            </div>
            <span className="font-bold text-success">{session.correctAnswers}</span>
          </div>

          <div className="text-center pt-4">
            <div className="text-5xl font-display font-bold text-primary">{accuracy}%</div>
            <p className="text-sm text-muted-foreground mt-1">{t("summary.overallAccuracy")}</p>
          </div>

          {session.skillsAttempted.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">{t("summary.skillsPracticed")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {session.skillsAttempted.map((skill) => (
                  <span
                    key={skill}
                    className="skill-chip bg-muted text-muted-foreground text-xs"
                  >
                    {skill.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleStartNewSession}
          className="btn-hero w-full flex items-center justify-center gap-3"
        >
          <span>{t("summary.startNew")}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-muted-foreground">
          {t("summary.privacy")}
        </p>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Summary;
