import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Sparkles, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  const navigate = useNavigate();
  const { createSession, isLoading } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleStartReading = async () => {
    setLoadingAction("start");
    try {
      await createSession();
      navigate("/select-level");
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAssessMe = async () => {
    setLoadingAction("assess");
    try {
      await createSession();
      navigate("/assessment");
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const featurePills = [
    { icon: Sparkles, label: t("home.pill.noJudgment") },
    { icon: Target, label: t("home.pill.findsLevel") },
    { icon: BookOpen, label: t("home.pill.ages") },
    { icon: TrendingUp, label: t("home.pill.track") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="HeyGetOnMyLevel — AI-Powered Reading Practice for All Ages"
        description="Find your reading level and grow with AI-generated passages, vocabulary checks, and read-aloud practice. Free, private, judgment-free literacy for ages 5–85+."
        path="/"
      />
      {/* Language Toggle */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label={language === "en" ? "Cambiar a Español" : "Switch to English"}
          >
            <span>{language === "en" ? "🇪🇸 Español" : "🇺🇸 English"}</span>
          </button>
          {language === "es" && (
            <p className="text-[11px] text-muted-foreground max-w-[220px] text-right leading-tight">
              Modo bilingüe: lees en inglés, te guiamos en español
            </p>
          )}
        </div>
      </div>

      {/* Problem Statement Banner */}
      <section className="bg-destructive/10 border-b border-destructive/20 py-4 px-6">
        <p className="text-center text-sm md:text-base text-foreground">
          <a 
            href="https://www.nu.edu/blog/49-adult-literacy-statistics-and-facts/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
          >
            {t("home.stat")}
          </a>{" "}
          {t("home.stat.suffix")}
          <span className="hidden sm:inline"> {t("home.stat.extra")}</span>
        </p>
      </section>

      {/* Hero Section */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4 fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
              HeyGet<span className="text-primary">on</span>MyLevel
            </h1>
            <p className="text-xl text-muted-foreground font-body max-w-lg mx-auto">
              {t("home.title.suffix")}
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 fade-in-up" style={{ animationDelay: "0.1s" }}>
            {featurePills.map((feature) => (
              <div
                key={feature.label}
                className="skill-chip bg-muted text-muted-foreground"
              >
                <feature.icon className="w-4 h-4" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Why This Matters */}
          <div className="bg-muted/50 rounded-2xl p-6 text-left space-y-3 fade-in-up max-w-md mx-auto" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-lg font-semibold text-foreground">{t("home.readingOpens")}</h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">{t("home.forAdults")}</strong> {t("home.forAdults.desc")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">{t("home.forStudents")}</strong> {t("home.forStudents.desc")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">{t("home.forParents")}</strong> {t("home.forParents.desc")}</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 pt-4 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={handleStartReading}
              disabled={isLoading}
              className="btn-hero w-full max-w-sm mx-auto flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === "start" ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("home.startReading")}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={handleAssessMe}
              disabled={isLoading}
              className="btn-secondary-hero w-full max-w-sm mx-auto flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === "assess" ? (
                <div className="w-6 h-6 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>{t("home.assessMe")}</span>
                </>
              )}
            </button>
          </div>

        {/* Sub-text */}
        <p className="text-sm text-muted-foreground fade-in-up" style={{ animationDelay: "0.3s" }}>
          {t("home.noAccount")}
        </p>
        <p className="text-xs text-muted-foreground/70 fade-in-up" style={{ animationDelay: "0.35s" }}>
          {t("home.assessmentNote")}
        </p>
        <p className="text-xs text-muted-foreground/60 fade-in-up" style={{ animationDelay: "0.4s" }}>
          {t("home.license")}{" "}
          <a
            href="mailto:privacy@time-2-read.com?subject=Commercial%20Licensing%20Inquiry"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {t("home.licenseLink")}
          </a>
          .
        </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
