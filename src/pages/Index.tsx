import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Sparkles, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { createSession, isLoading } = useSession();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Problem Statement Banner */}
      <section className="bg-destructive/10 border-b border-destructive/20 py-4 px-6">
        <p className="text-center text-sm md:text-base text-foreground">
          <a 
            href="https://www.nu.edu/blog/49-adult-literacy-statistics-and-facts/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid transition-all"
          >
            54% of U.S. adults
          </a>{" "}
          read below a 6th-grade level.
          <span className="hidden sm:inline"> Reading struggles don't have to be permanent.</span>
        </p>
      </section>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
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
              Whether you're 8 or 80, it's never too late to reach your reading potential. 
              Build the skills you need — at your own pace, on your own terms.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 fade-in-up" style={{ animationDelay: "0.1s" }}>
            {[
              { icon: Sparkles, label: "No Judgment" },
              { icon: Target, label: "Finds Your Level" },
              { icon: BookOpen, label: "Ages 5 to 85" },
              { icon: TrendingUp, label: "Track Progress" },
            ].map((feature) => (
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
            <h2 className="text-lg font-semibold text-foreground">Reading opens doors</h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">For adults:</strong> Improve job applications, health literacy, and daily confidence</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">For students:</strong> Catch up to grade level with adaptive, judgment-free practice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">For parents:</strong> Help your child build foundational reading skills at home</span>
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
                  <span>Start Reading Now</span>
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
                  <span>Assess My Level</span>
                </>
              )}
            </button>
          </div>

        {/* Sub-text */}
        <p className="text-sm text-muted-foreground fade-in-up" style={{ animationDelay: "0.3s" }}>
          No account needed • Completely free • Your progress stays private
        </p>
        <p className="text-xs text-muted-foreground/70 fade-in-up" style={{ animationDelay: "0.35s" }}>
          📚 Assessment uses curated material • Reading sessions let you pick your topic
        </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          54 million American adults struggle with literacy. You don't have to be one of them.
        </p>
      </footer>
    </div>
  );
};

export default Index;
