import { useState, useEffect, useRef } from "react";
import { Send, Bot, Sparkles, Loader2, Lightbulb, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getHintForQuestionType, STATIC_HELP_TIPS } from "@/constants/readingHints";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Message {
  role: "user" | "assistant" | "hint";
  content: string;
}

interface AITutorProps {
  passageText: string;
  gradeLevel: number;
  currentQuestion?: string;
  currentQuestionType?: string;
  passageId?: string; // Used to reset state when passage changes
  maxMessages?: number; // Strategy 1: Rate limit
}

const AITutor = ({ 
  passageText, 
  gradeLevel, 
  currentQuestion, 
  currentQuestionType,
  passageId,
  maxMessages = 5 // Strategy 1: Default limit of 5 AI messages
}: AITutorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm your reading buddy. Read through the passage first, then if you get stuck, I'm here to help!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessageCount, setAiMessageCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const { speak, stop, isSupported } = useTextToSpeech();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset state when passage changes
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi there! 👋 I'm your reading buddy. Read through the passage first, then if you get stuck, I'm here to help!",
      },
    ]);
    setAiMessageCount(0);
    setHintsUsed(0);
    setSpeakingIndex(null);
    stop();
  }, [passageId, stop]);

  // Auto-read new assistant/hint messages aloud
  useEffect(() => {
    if (!isSupported || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" || lastMsg.role === "hint") {
      const cleanText = lastMsg.content.replace(/[\u{1F600}-\u{1F9FF}]/gu, "").trim();
      if (cleanText) {
        setSpeakingIndex(messages.length - 1);
        stop();
        // Small delay so UI updates first
        setTimeout(() => speak(cleanText, 0.9), 150);
      }
    }
  }, [messages.length]);

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      stop();
      setSpeakingIndex(null);
    } else {
      stop();
      const cleanText = text.replace(/[\u{1F600}-\u{1F9FF}]/gu, "").trim();
      setSpeakingIndex(index);
      speak(cleanText, 0.9);
    }
  };

  const isLimitReached = aiMessageCount >= maxMessages;

  const handleSend = async () => {
    if (!input.trim() || isLoading || isLimitReached) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-reading", {
        body: {
          type: "tutor",
          gradeLevel,
          passageText,
          userQuestion: userMessage,
          currentQuestion,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "I'm here to help! Could you rephrase that?" },
      ]);
      setAiMessageCount((prev) => prev + 1); // Strategy 1: Increment counter
    } catch (err) {
      console.error("Tutor error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! I had trouble thinking. Try asking again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Strategy 7: Show client-side hint first
  const handleQuickHint = () => {
    if (hintsUsed < 2) {
      // Show client-side hint first
      const hint = getHintForQuestionType(currentQuestionType, hintsUsed);
      setMessages((prev) => [
        ...prev,
        { role: "hint", content: hint },
      ]);
      setHintsUsed((prev) => prev + 1);
    } else if (!isLimitReached) {
      // After 2 client hints, allow AI hint
      setInput("Give me a hint");
    }
  };

  const quickPrompts = [
    { label: hintsUsed < 2 ? "Give me a hint" : "AI Hint", action: handleQuickHint },
    { label: "Explain in simpler words", action: () => setInput("Explain in simpler words") },
    { label: "What's the main idea?", action: () => setInput("What's the main idea?") },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">AI Reading Buddy</h3>
            <p className="text-xs text-muted-foreground">
              {isLimitReached 
                ? "You're doing great on your own!" 
                : `${maxMessages - aiMessageCount} AI helps remaining`}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-accent ml-auto" />
        </div>
      </div>

      {/* Strategy 4: Static help tips */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">💡 Try these first:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {STATIC_HELP_TIPS.slice(0, 3).map((tip, i) => (
            <li key={i}>• {tip}</li>
          ))}
        </ul>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : message.role === "hint"
                  ? "bg-accent/20 text-foreground rounded-bl-md border border-accent/30"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {message.role === "hint" && (
                <div className="flex items-center gap-1 mb-1 text-accent">
                  <Lightbulb className="w-3 h-3" />
                  <span className="text-xs font-medium">Quick Tip</span>
                </div>
              )}
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Strategy 1: Limit reached message */}
      {isLimitReached && (
        <div className="px-4 py-3 bg-success/10 border-t border-success/20">
          <div className="flex items-center gap-2 text-sm text-success">
            <AlertCircle className="w-4 h-4" />
            <span>You're doing great! Try answering on your own now. 💪</span>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {!isLimitReached && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={prompt.action}
              disabled={isLoading}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLimitReached ? "Keep going on your own!" : "Ask me anything..."}
            disabled={isLimitReached}
            className="flex-1 px-4 py-3 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isLimitReached}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
