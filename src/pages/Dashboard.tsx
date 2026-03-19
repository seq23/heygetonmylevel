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
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  image: string;
  featured?: boolean;
}

const skills: Skill[] = [
  {
    id: "phonics",
    name: "Phonics",
    description: "Learn letter sounds & blend them into words",
    icon: Volume2,
    color: "bg-secondary/10 text-secondary",
    image: skillPhonics,
    featured: true,
  },
  {
    id: "decoding",
    name: "Decoding",
    description: "Breaking down words into parts",
    icon: Search,
    color: "bg-primary/10 text-primary",
    image: skillDecoding,
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    description: "Understanding word meanings",
    icon: BookOpen,
    color: "bg-secondary/10 text-secondary",
    image: skillVocabulary,
  },
  {
    id: "inference",
    name: "Inference",
    description: "Reading between the lines",
    icon: Lightbulb,
    color: "bg-accent/20 text-accent-foreground",
    image: skillInference,
  },
  {
    id: "cause_effect",
    name: "Cause & Effect",
    description: "Understanding why things happen",
    icon: Link2,
    color: "bg-success/10 text-success",
    image: skillCauseEffect,
  },
  {
    id: "reasoning",
    name: "Multi-step Reasoning",
    description: "Following complex arguments",
    icon: Brain,
    color: "bg-primary/10 text-primary",
    image: skillReasoning,
  },
  {
    id: "critical",
    name: "Critical Thinking",
    description: "Analyzing and evaluating",
    icon: Sparkles,
    color: "bg-secondary/10 text-secondary",
    image: skillCritical,
  },
  {
    id: "comprehension",
    name: "Comprehension",
    description: "Understanding full passages",
    icon: MessageSquare,
    color: "bg-accent/20 text-accent-foreground",
    image: skillComprehension,
  },
];

// Theme suggestions by grade level
const getThemeSuggestions = (level: number): string[] => {
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
  const [theme, setTheme] = useState("");

  if (!session || !session.readingLevel) {
    navigate("/");
    return null;
  }

  const handleStartSession = (skillFocus?: string) => {
    navigate("/session", { state: { skillFocus, theme: theme.trim() || undefined } });
  };

  const themeSuggestions = getThemeSuggestions(session.readingLevel);

  const gradeLabel =
    session.readingLevel <= 12 ? `Grade ${session.readingLevel}` : "College";

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
            <h1 className="text-xl font-display font-bold">Learning Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Practice at your own pace
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-8 px-6 space-y-8">
        {/* Level Card */}
        <div className="card-elevated text-center fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl font-display font-bold text-primary">
              {session.readingLevel <= 12 ? session.readingLevel : "C"}
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold">Today's Level: {gradeLabel}</h2>
          <p className="text-muted-foreground mt-1">
            {session.assessmentTaken
              ? "Based on your assessment"
              : "You selected this level"}
          </p>
          <button
            onClick={() => navigate("/select-level")}
            className="text-sm text-primary font-medium mt-3 hover:underline"
          >
            Change level
          </button>
        </div>

        {/* Theme Selection */}
        <div className="card-elevated fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold">What do you want to read about?</h3>
              <p className="text-sm text-muted-foreground">Optional - leave blank for variety</p>
            </div>
          </div>
          <Input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., superheroes, space adventure, romance..."
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
          <span>Start Reading Session</span>
        </button>

        {/* Skills Section */}
        <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-lg font-display font-bold mb-4">Practice a Specific Skill</h3>
          
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
                  alt={skill.name} 
                  className="w-20 h-20 object-contain flex-shrink-0" 
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary">⭐ Recommended</span>
                  </div>
                  <p className="font-display font-bold text-lg text-foreground">{skill.name}</p>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
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
                    alt={skill.name} 
                    className="w-14 h-14 object-contain flex-shrink-0" 
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{skill.name}</p>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Stats (if any) */}
        {session.questionsAnswered > 0 && (
          <div className="card-elevated fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-display font-bold mb-4">This Session</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">
                  {session.questionsAnswered}
                </p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-success/10">
                <p className="text-2xl font-bold text-success">
                  {Math.round((session.correctAnswers / session.questionsAnswered) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
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
