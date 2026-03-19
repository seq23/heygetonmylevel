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
  passageId?: string;
  maxMessages?: number;
  onPendingMessage?: (hasPending: boolean) => void;
  isVisible?: boolean;
}

const WELCOME_SEQUENCE = [
  `Hi there! 👋 I'm your Reading Buddy!`,
  `Here's how I work:\n\nI'm here to help you on your reading journey! You will read the passage on the screen first, and then press the big green "I'm Ready for Questions" button when you've finished.`,
  `📱 On a phone or tablet, tap the "✕" button to close me and start reading. Tap the little robot icon 🤖 at the top of the screen to find me again.\n\nYou can stop me talking anytime by pressing the small stop icon while I'm speaking.`,
  `💻 On a computer, I'll be right here beside your passage. You can type questions to me or use the quick buttons below.\n\nYou can also tap any word in the passage to hear how it sounds!`,
  `Take your time reading — there's no rush! I'm here whenever you need me. 📚\n\nBefore we start, what's your name? (Or what would you like me to call you?)`,
];

const STORAGE_KEY_NAME = "reading_buddy_name";
const STORAGE_KEY_WELCOMED = "reading_buddy_welcomed";

const AITutor = ({
  passageText,
  gradeLevel,
  currentQuestion,
  currentQuestionType,
  passageId,
  maxMessages = 5,
  onPendingMessage,
  isVisible = true,
}: AITutorProps) => {
  // Load persisted name from localStorage
  const storedName = localStorage.getItem(STORAGE_KEY_NAME);
  const hasBeenWelcomed = localStorage.getItem(STORAGE_KEY_WELCOMED) === "true";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiMessageCount, setAiMessageCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(storedName);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [isWelcoming, setIsWelcoming] = useState(!hasBeenWelcomed);
  const [pendingMessages, setPendingMessages] = useState(0);
  const { speak, speakAsync, stop, isSupported } = useTextToSpeech();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPassageIdRef = useRef<string | undefined>(passageId);
  const isInitialMount = useRef(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Initialize: either welcome sequence or returning greeting
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    if (hasBeenWelcomed && storedName) {
      // Returning user — short greeting
      setMessages([{
        role: "assistant",
        content: `Hi ${storedName}! 👋 How can I help you today?`,
      }]);
      setIsWelcoming(false);
    } else if (hasBeenWelcomed && !storedName) {
      // Welcomed but no name stored (edge case)
      setMessages([{
        role: "assistant",
        content: `Hi there! 👋 How can I help you today?`,
      }]);
      setIsWelcoming(false);
    }
    // else: first time — welcome sequence kicks in via the other effect
  }, []);

  // Welcome sequence: wait for each spoken message to finish, then pause before next
  useEffect(() => {
    if (!isWelcoming) return;

    if (welcomeStep >= WELCOME_SEQUENCE.length) {
      setIsWelcoming(false);
      localStorage.setItem(STORAGE_KEY_WELCOMED, "true");
      return;
    }

    let cancelled = false;

    const playWelcomeStep = async () => {
      const msg = WELCOME_SEQUENCE[welcomeStep];
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);

      const spokenText = cleanForTTS(msg);
      if (isVisible && isSupported && spokenText) {
        await speakAsync(spokenText, 0.7);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      if (cancelled) return;

      // Longer pause between messages so pacing feels calm and complete
      welcomeTimerRef.current = setTimeout(() => {
        setWelcomeStep((prev) => prev + 1);
      }, 1800);
    };

    playWelcomeStep();

    return () => {
      cancelled = true;
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
      stop();
    };
  }, [welcomeStep, isWelcoming, isVisible, isSupported, speakAsync, stop]);

  // Reset per-passage state when passage changes (not on first mount)
  useEffect(() => {
    if (previousPassageIdRef.current === passageId) return;

    previousPassageIdRef.current = passageId;
    setAiMessageCount(0);
    setHintsUsed(0);
    setSpeakingIndex(null);
    setPendingMessages(0);
    stop();
    if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);

    // On new passage, give returning greeting (don't re-run full welcome)
    const name = localStorage.getItem(STORAGE_KEY_NAME);
    if (name) {
      setUserName(name);
      setMessages([{
        role: "assistant",
        content: `Hi ${name}! 👋 Here's a new passage for you. How can I help?`,
      }]);
      setIsWelcoming(false);
    } else {
      setMessages([{
        role: "assistant",
        content: `Hi there! 👋 New passage ready. How can I help?`,
      }]);
      setIsWelcoming(false);
    }
  }, [passageId, stop]);

  // Track pending messages when buddy is not visible
  useEffect(() => {
    if (!isVisible && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" || lastMsg.role === "hint") {
        setPendingMessages((prev) => prev + 1);
        onPendingMessage?.(true);
      }
    }
  }, [messages.length, isVisible]);

  // Clear pending when buddy becomes visible
  useEffect(() => {
    if (isVisible && pendingMessages > 0) {
      setPendingMessages(0);
      onPendingMessage?.(false);
    }
  }, [isVisible, pendingMessages, onPendingMessage]);

  // Clean text for TTS
  const cleanForTTS = (text: string): string => {
    return text
      .replace(/[""\u201C\u201D]✕[""\u201C\u201D]/g, "ex")
      .replace(/✕/g, "ex")
      .replace(/[\u{1F600}-\u{1F9FF}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
      .replace(/[\u{200D}]/gu, "")
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Auto-read new assistant/hint messages aloud (only when visible, not during welcome sequence)
  useEffect(() => {
    if (!isSupported || messages.length === 0 || !isVisible || isWelcoming) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" || lastMsg.role === "hint") {
      const cleanText = cleanForTTS(lastMsg.content);
      if (cleanText) {
        setSpeakingIndex(messages.length - 1);
        stop();
        setTimeout(() => speak(cleanText, 0.7), 150);
      }
    }
  }, [messages.length, isVisible, isWelcoming]);

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      stop();
      setSpeakingIndex(null);
    } else {
      stop();
      const cleanText = cleanForTTS(text);
      setSpeakingIndex(index);
      speak(cleanText, 0.7);
    }
  };

  const isLimitReached = aiMessageCount >= maxMessages;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // If we're still waiting for the user's name
    if (!userName) {
      const name = userMessage.replace(/^(my name is |i'm |im |call me |it's |its )/i, "").trim();
      const cleanName = name.split(/\s/)[0];
      const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
      setUserName(capitalizedName);
      localStorage.setItem(STORAGE_KEY_NAME, capitalizedName);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Nice to meet you, ${capitalizedName}! 🎉\n\nI'll be right here if you need help. Go ahead and start reading your passage — you've got this!`,
          },
        ]);
      }, 800);
      return;
    }

    if (isLimitReached) return;

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

      const response = data.response || "I'm here to help! Could you rephrase that?";
      const personalizedResponse = userName
        ? response.replace(/^(Great question|Good question|Nice question)/i, `$1, ${userName}`)
        : response;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: personalizedResponse },
      ]);
      setAiMessageCount((prev) => prev + 1);
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

  const handleQuickHint = () => {
    if (hintsUsed < 2) {
      const hint = getHintForQuestionType(currentQuestionType, hintsUsed);
      setMessages((prev) => [...prev, { role: "hint", content: hint }]);
      setHintsUsed((prev) => prev + 1);
    } else if (!isLimitReached) {
      setInput("Give me a hint");
    }
  };

  const quickPrompts = [
    { label: hintsUsed < 2 ? "Give me a hint" : "AI Hint", action: handleQuickHint },
    { label: "Explain in simpler words", action: () => setInput("Explain in simpler words") },
    { label: "What's the main idea?", action: () => setInput("What's the main idea?") },
  ];

  const getPlaceholder = () => {
    if (!userName && !isWelcoming) return "Type your name here...";
    if (isLimitReached) return "Keep going on your own!";
    return userName ? `Ask me anything, ${userName}...` : "Ask me anything...";
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">
              AI Reading Buddy
            </h3>
            <p className="text-xs text-muted-foreground">
              {isWelcoming
                ? "Getting ready..."
                : isLimitReached
                ? "You're doing great on your own!"
                : `${maxMessages - aiMessageCount} AI helps remaining`}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-accent ml-auto" />
        </div>
      </div>

      {/* Static help tips */}
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
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} fade-in-up`}
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
              <span className="whitespace-pre-wrap">{message.content}</span>
              {message.role !== "user" && isSupported && (
                <button
                  onClick={() => handleSpeak(message.content, index)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  aria-label={speakingIndex === index ? "Stop reading" : "Read aloud"}
                >
                  {speakingIndex === index ? (
                    <><VolumeX className="w-3.5 h-3.5" /> Stop</>
                  ) : (
                    <><Volume2 className="w-3.5 h-3.5" /> Read aloud</>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isWelcoming && welcomeStep > 0 && welcomeStep < WELCOME_SEQUENCE.length && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Limit reached message */}
      {isLimitReached && (
        <div className="px-4 py-3 bg-success/10 border-t border-success/20">
          <div className="flex items-center gap-2 text-sm text-success">
            <AlertCircle className="w-4 h-4" />
            <span>You're doing great! Try answering on your own now. 💪</span>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {!isLimitReached && !isWelcoming && userName && (
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
            placeholder={getPlaceholder()}
            disabled={isLimitReached || isWelcoming}
            className="flex-1 px-4 py-3 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isLimitReached || isWelcoming}
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
