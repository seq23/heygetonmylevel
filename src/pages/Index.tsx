import { useNavigate } from "react-router-dom";
import { BookOpen, Target, Sparkles, ArrowRight } from "lucide-react";
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
            <p className="text-xl text-muted-foreground font-body max-w-md mx-auto">
              Improve your reading skills with AI-powered practice tailored just for you
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 fade-in-up" style={{ animationDelay: "0.1s" }}>
            {[
              { icon: Sparkles, label: "AI-Powered" },
              { icon: Target, label: "Adaptive Learning" },
              { icon: BookOpen, label: "All Levels" },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="skill-chip bg-muted text-muted-foreground"
              >
                <feature.icon className="w-4 h-4" />
                <span>{feature.label}</span>
              </div>
            ))}
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
            No account needed • Free forever • Your progress stays private
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Helping readers reach their potential, one passage at a time
        </p>
      </footer>
    </div>
  );
};

export default Index;
