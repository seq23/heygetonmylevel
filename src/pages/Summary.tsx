import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, BookOpen, Target, Star, ArrowRight } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

const Summary = () => {
  const navigate = useNavigate();
  const { session, endSession } = useSession();

  // Clean up session when leaving this page
  useEffect(() => {
    return () => {
      // Session will be deleted when user navigates away
    };
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
      ? `Grade ${session.readingLevel}`
      : "College";

  const encouragementMessage = () => {
    if (accuracy >= 80) return "Outstanding work! You're really getting the hang of this!";
    if (accuracy >= 60) return "Great progress! Keep practicing to improve even more.";
    if (accuracy >= 40) return "Nice effort! Every question helps you learn.";
    return "Good start! Reading takes practice, and you're on your way.";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8 fade-in-up">
        {/* Celebration Icon */}
        <div className="celebration-bounce">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-accent/20 mb-4">
            <Trophy className="w-14 h-14 text-accent-foreground" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-display font-bold">Session Complete!</h1>
          <p className="text-muted-foreground mt-2">{encouragementMessage()}</p>
        </div>

        {/* Stats Card */}
        <div className="card-elevated space-y-6">
          {/* Level */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Level Practiced</span>
            </div>
            <span className="font-bold text-foreground">{gradeLabel}</span>
          </div>

          {/* Questions */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-muted-foreground">Questions Answered</span>
            </div>
            <span className="font-bold text-foreground">{session.questionsAnswered}</span>
          </div>

          {/* Correct */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <Star className="w-5 h-5 text-success" />
              </div>
              <span className="text-muted-foreground">Correct Answers</span>
            </div>
            <span className="font-bold text-success">{session.correctAnswers}</span>
          </div>

          {/* Accuracy */}
          <div className="text-center pt-4">
            <div className="text-5xl font-display font-bold text-primary">{accuracy}%</div>
            <p className="text-sm text-muted-foreground mt-1">Overall Accuracy</p>
          </div>

          {/* Skills */}
          {session.skillsAttempted.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Skills Practiced</p>
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

        {/* CTA */}
        <button
          onClick={handleStartNewSession}
          className="btn-hero w-full flex items-center justify-center gap-3"
        >
          <span>Start New Session</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground">
          Your session data has been cleared. We don't store any personal information.
        </p>
      </div>
    </div>
  );
};

export default Summary;
