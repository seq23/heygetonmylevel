import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Home, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSession } from "@/contexts/SessionContext";
import Footer from "@/components/Footer";

interface PhonicsPattern {
  letters: string;
  soundsLike: string;
  pronunciation: string; // What to pass to TTS
  examples: { word: string; highlight: string }[];
  tip: string;
}

interface PhonicsCategory {
  id: string;
  title: string;
  description: string;
  emoji: string;
  patterns: PhonicsPattern[];
}

const phonicsData: PhonicsCategory[] = [
  {
    id: "single-consonants",
    title: "Single Letter Sounds",
    description: "The basics — every letter makes a sound",
    emoji: "🔤",
    patterns: [
      { letters: "B", soundsLike: "buh", pronunciation: "buh", examples: [{ word: "ball", highlight: "b" }, { word: "bed", highlight: "b" }, { word: "bug", highlight: "b" }], tip: "Press your lips together, then pop them open!" },
      { letters: "C", soundsLike: "kuh (hard) or sss (soft)", pronunciation: "kuh", examples: [{ word: "cat", highlight: "c" }, { word: "city", highlight: "c" }, { word: "cup", highlight: "c" }], tip: "Hard C before a, o, u. Soft C before e, i, y." },
      { letters: "D", soundsLike: "duh", pronunciation: "duh", examples: [{ word: "dog", highlight: "d" }, { word: "door", highlight: "d" }, { word: "duck", highlight: "d" }], tip: "Touch your tongue behind your top teeth!" },
      { letters: "F", soundsLike: "fff", pronunciation: "fff", examples: [{ word: "fish", highlight: "f" }, { word: "fan", highlight: "f" }, { word: "fun", highlight: "f" }], tip: "Bite your bottom lip gently and blow air." },
      { letters: "G", soundsLike: "guh", pronunciation: "guh", examples: [{ word: "go", highlight: "g" }, { word: "game", highlight: "g" }, { word: "got", highlight: "g" }], tip: "Feel the sound in the back of your throat." },
      { letters: "H", soundsLike: "huh", pronunciation: "huh", examples: [{ word: "hat", highlight: "h" }, { word: "hot", highlight: "h" }, { word: "house", highlight: "h" }], tip: "Like you're breathing on a window to fog it up!" },
    ],
  },
  {
    id: "short-vowels",
    title: "Short Vowel Sounds",
    description: "Every word needs a vowel — learn their short sounds",
    emoji: "🅰️",
    patterns: [
      { letters: "A", soundsLike: "ah (like in cat)", pronunciation: "ah", examples: [{ word: "cat", highlight: "a" }, { word: "bat", highlight: "a" }, { word: "map", highlight: "a" }], tip: "Open your mouth wide, like at the doctor!" },
      { letters: "E", soundsLike: "eh (like in bed)", pronunciation: "eh", examples: [{ word: "bed", highlight: "e" }, { word: "red", highlight: "e" }, { word: "pen", highlight: "e" }], tip: "Smile a little bit — your mouth is slightly open." },
      { letters: "I", soundsLike: "ih (like in sit)", pronunciation: "ih", examples: [{ word: "sit", highlight: "i" }, { word: "pig", highlight: "i" }, { word: "fin", highlight: "i" }], tip: "Quick, short sound — lips barely move!" },
      { letters: "O", soundsLike: "ah (like in hot)", pronunciation: "ah", examples: [{ word: "hot", highlight: "o" }, { word: "dog", highlight: "o" }, { word: "top", highlight: "o" }], tip: "Round your lips like a little circle." },
      { letters: "U", soundsLike: "uh (like in cup)", pronunciation: "uh", examples: [{ word: "cup", highlight: "u" }, { word: "bug", highlight: "u" }, { word: "sun", highlight: "u" }], tip: "Like you're thinking... 'uh...'" },
    ],
  },
  {
    id: "consonant-digraphs",
    title: "Letter Teams (Digraphs)",
    description: "Two letters that make ONE new sound",
    emoji: "🤝",
    patterns: [
      { letters: "SH", soundsLike: "shh (like 'be quiet!')", pronunciation: "shh", examples: [{ word: "ship", highlight: "sh" }, { word: "fish", highlight: "sh" }, { word: "shell", highlight: "sh" }], tip: "Put your finger to your lips — shhhh!" },
      { letters: "CH", soundsLike: "ch (like a train: choo choo!)", pronunciation: "ch", examples: [{ word: "chip", highlight: "ch" }, { word: "lunch", highlight: "ch" }, { word: "chair", highlight: "ch" }], tip: "Starts with your tongue on the roof of your mouth." },
      { letters: "TH", soundsLike: "th (tongue between teeth)", pronunciation: "th", examples: [{ word: "this", highlight: "th" }, { word: "that", highlight: "th" }, { word: "think", highlight: "th" }], tip: "Stick your tongue out slightly between your teeth!" },
      { letters: "WH", soundsLike: "wh (like blowing air)", pronunciation: "wh", examples: [{ word: "what", highlight: "wh" }, { word: "when", highlight: "wh" }, { word: "where", highlight: "wh" }], tip: "Round your lips and blow gently, then add a sound." },
      { letters: "PH", soundsLike: "f (sounds just like F!)", pronunciation: "fff", examples: [{ word: "phone", highlight: "ph" }, { word: "photo", highlight: "ph" }, { word: "elephant", highlight: "ph" }], tip: "Surprise! PH makes the same sound as F." },
      { letters: "CK", soundsLike: "k (a quick, sharp sound)", pronunciation: "k", examples: [{ word: "duck", highlight: "ck" }, { word: "back", highlight: "ck" }, { word: "kick", highlight: "ck" }], tip: "CK always comes after a short vowel sound." },
      { letters: "NG", soundsLike: "ng (like in sing)", pronunciation: "ng", examples: [{ word: "ring", highlight: "ng" }, { word: "song", highlight: "ng" }, { word: "king", highlight: "ng" }], tip: "Feel the buzz in the back of your throat!" },
    ],
  },
  {
    id: "consonant-blends",
    title: "Consonant Blends",
    description: "Two letters that BLEND — you hear both sounds",
    emoji: "🎵",
    patterns: [
      { letters: "BL", soundsLike: "bl (b + l together)", pronunciation: "bl", examples: [{ word: "blue", highlight: "bl" }, { word: "black", highlight: "bl" }, { word: "block", highlight: "bl" }], tip: "Say B then L quickly — they overlap!" },
      { letters: "BR", soundsLike: "br (b + r together)", pronunciation: "br", examples: [{ word: "brown", highlight: "br" }, { word: "bread", highlight: "br" }, { word: "brush", highlight: "br" }], tip: "Feel both the B pop and the R rumble." },
      { letters: "CL", soundsLike: "cl (c + l together)", pronunciation: "cl", examples: [{ word: "clap", highlight: "cl" }, { word: "clean", highlight: "cl" }, { word: "class", highlight: "cl" }], tip: "The C sound slides right into the L." },
      { letters: "CR", soundsLike: "cr (c + r together)", pronunciation: "cr", examples: [{ word: "crab", highlight: "cr" }, { word: "cry", highlight: "cr" }, { word: "cream", highlight: "cr" }], tip: "Quick K sound then roll into R." },
      { letters: "FL", soundsLike: "fl (f + l together)", pronunciation: "fl", examples: [{ word: "flag", highlight: "fl" }, { word: "fly", highlight: "fl" }, { word: "floor", highlight: "fl" }], tip: "Blow air for F, then glide to L." },
      { letters: "FR", soundsLike: "fr (f + r together)", pronunciation: "fr", examples: [{ word: "frog", highlight: "fr" }, { word: "free", highlight: "fr" }, { word: "from", highlight: "fr" }], tip: "Air through teeth for F, then R." },
      { letters: "ST", soundsLike: "st (s + t together)", pronunciation: "st", examples: [{ word: "star", highlight: "st" }, { word: "stop", highlight: "st" }, { word: "step", highlight: "st" }], tip: "Hiss the S then tap the T." },
      { letters: "TR", soundsLike: "tr (t + r together)", pronunciation: "tr", examples: [{ word: "tree", highlight: "tr" }, { word: "train", highlight: "tr" }, { word: "truck", highlight: "tr" }], tip: "Quick T then flow into R." },
    ],
  },
  {
    id: "long-vowels",
    title: "Long Vowel Teams",
    description: "When two vowels walk, the first one talks!",
    emoji: "🗣️",
    patterns: [
      { letters: "AI / AY", soundsLike: "long A (says its name!)", pronunciation: "ay", examples: [{ word: "rain", highlight: "ai" }, { word: "play", highlight: "ay" }, { word: "train", highlight: "ai" }], tip: "AI in the middle, AY at the end of a word." },
      { letters: "EA / EE", soundsLike: "long E (says its name!)", pronunciation: "ee", examples: [{ word: "read", highlight: "ea" }, { word: "tree", highlight: "ee" }, { word: "beach", highlight: "ea" }], tip: "Both make the same 'ee' sound — smile wide!" },
      { letters: "OA / OW", soundsLike: "long O (says its name!)", pronunciation: "oh", examples: [{ word: "boat", highlight: "oa" }, { word: "snow", highlight: "ow" }, { word: "road", highlight: "oa" }], tip: "OA in the middle, OW at the end." },
      { letters: "OO", soundsLike: "oo (like in moon)", pronunciation: "oo", examples: [{ word: "moon", highlight: "oo" }, { word: "food", highlight: "oo" }, { word: "boot", highlight: "oo" }], tip: "Round your lips into a tiny O shape." },
      { letters: "OU / OW", soundsLike: "ow (like 'ouch!')", pronunciation: "ow", examples: [{ word: "house", highlight: "ou" }, { word: "cow", highlight: "ow" }, { word: "loud", highlight: "ou" }], tip: "Start with 'ah' and slide to 'oo'." },
    ],
  },
  {
    id: "r-controlled",
    title: "Bossy R Vowels",
    description: "When R comes after a vowel, it changes the sound!",
    emoji: "💪",
    patterns: [
      { letters: "AR", soundsLike: "ar (like a pirate: arrr!)", pronunciation: "ar", examples: [{ word: "car", highlight: "ar" }, { word: "star", highlight: "ar" }, { word: "farm", highlight: "ar" }], tip: "Open wide and growl like a pirate! Arrr!" },
      { letters: "ER", soundsLike: "er (like 'her')", pronunciation: "er", examples: [{ word: "her", highlight: "er" }, { word: "water", highlight: "er" }, { word: "sister", highlight: "er" }], tip: "ER, IR, and UR all sound the same!" },
      { letters: "IR", soundsLike: "er (like 'bird')", pronunciation: "er", examples: [{ word: "bird", highlight: "ir" }, { word: "girl", highlight: "ir" }, { word: "first", highlight: "ir" }], tip: "Same sound as ER — just spelled differently." },
      { letters: "OR", soundsLike: "or (like 'more')", pronunciation: "or", examples: [{ word: "for", highlight: "or" }, { word: "corn", highlight: "or" }, { word: "horse", highlight: "or" }], tip: "Round your lips and add a growl." },
      { letters: "UR", soundsLike: "er (like 'fur')", pronunciation: "er", examples: [{ word: "fur", highlight: "ur" }, { word: "turn", highlight: "ur" }, { word: "burn", highlight: "ur" }], tip: "Same as ER and IR — English is tricky!" },
    ],
  },
  {
    id: "silent-letters",
    title: "Sneaky Silent Letters",
    description: "These letters are there but you DON'T say them!",
    emoji: "🤫",
    patterns: [
      { letters: "KN", soundsLike: "n (the K is silent!)", pronunciation: "n", examples: [{ word: "know", highlight: "kn" }, { word: "knee", highlight: "kn" }, { word: "knife", highlight: "kn" }], tip: "Ignore the K completely — just say N." },
      { letters: "WR", soundsLike: "r (the W is silent!)", pronunciation: "r", examples: [{ word: "write", highlight: "wr" }, { word: "wrong", highlight: "wr" }, { word: "wrap", highlight: "wr" }], tip: "The W is just decoration — say R." },
      { letters: "GN", soundsLike: "n (the G is silent!)", pronunciation: "n", examples: [{ word: "gnaw", highlight: "gn" }, { word: "gnat", highlight: "gn" }, { word: "sign", highlight: "gn" }], tip: "Skip the G — it's hiding!" },
      { letters: "MB", soundsLike: "m (the B is silent!)", pronunciation: "m", examples: [{ word: "lamb", highlight: "mb" }, { word: "climb", highlight: "mb" }, { word: "thumb", highlight: "mb" }], tip: "The B at the end is completely silent." },
    ],
  },
];

const Phonics = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { speak, isSupported } = useTextToSpeech();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [practicedPatterns, setPracticedPatterns] = useState<Set<string>>(new Set());

  if (!session) {
    navigate("/");
    return null;
  }

  const activeCategory = phonicsData.find((c) => c.id === selectedCategory);

  const handlePlaySound = (pronunciation: string, letters: string) => {
    if (isSupported) {
      speak(pronunciation, 0.5, 1.0);
      setPracticedPatterns((prev) => new Set(prev).add(letters));
    }
  };

  const handlePlayWord = (word: string) => {
    if (isSupported) {
      speak(word, 0.6, 0.9);
    }
  };

  const highlightWord = (word: string, highlight: string) => {
    const lowerWord = word.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const idx = lowerWord.indexOf(lowerHighlight);
    if (idx === -1) return <span>{word}</span>;

    return (
      <span>
        {word.slice(0, idx)}
        <span className="text-primary font-bold underline decoration-primary decoration-2 underline-offset-2">
          {word.slice(idx, idx + highlight.length)}
        </span>
        {word.slice(idx + highlight.length)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4 px-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Go home"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                if (selectedCategory) {
                  setSelectedCategory(null);
                } else {
                  navigate("/dashboard");
                }
              }}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">
              {activeCategory ? activeCategory.title : "Learn Phonics"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeCategory
                ? activeCategory.description
                : "Tap a category to start learning sounds"}
            </p>
          </div>
          {practicedPatterns.size > 0 && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <Star className="w-4 h-4 fill-primary" />
              <span className="font-semibold">{practicedPatterns.size}</span>
            </div>
          )}
        </div>
      </header>

      <main className="container max-w-4xl py-6 px-4 flex-1">
        {!activeCategory ? (
          /* Category Selection */
          <div className="space-y-4 fade-in-up">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm text-foreground">
                <strong>How to use:</strong> Pick a category, then tap each sound to hear it. 
                Tap example words to hear them too. Take your time — there's no test!
              </p>
            </div>

            {phonicsData.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="w-full card-elevated text-left hover:ring-2 hover:ring-primary/50 transition-all fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{category.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-foreground text-lg">
                      {category.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.patterns.length} sounds to learn
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Pattern Learning View */
          <div className="space-y-6 fade-in-up">
            {activeCategory.patterns.map((pattern, index) => (
              <div
                key={pattern.letters}
                className="card-elevated fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Letter + Sound Header */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => handlePlaySound(pattern.pronunciation, pattern.letters)}
                    className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors group"
                    aria-label={`Play sound for ${pattern.letters}`}
                  >
                    <span className="text-3xl font-display font-bold text-primary">
                      {pattern.letters}
                    </span>
                    <Volume2 className="absolute bottom-1 right-1 w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                    {practicedPatterns.has(pattern.letters) && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-success fill-background" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">
                      Sounds like: <span className="text-primary">"{pattern.soundsLike}"</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      💡 {pattern.tip}
                    </p>
                  </div>
                </div>

                {/* Example Words */}
                <div className="flex flex-wrap gap-3">
                  {pattern.examples.map((example) => (
                    <button
                      key={example.word}
                      onClick={() => handlePlayWord(example.word)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-lg font-medium min-h-[44px]"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {highlightWord(example.word, example.highlight)}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Done Banner */}
            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-4">
                🎉 You've seen all the sounds in this category!
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn-hero inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Try Another Category
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Phonics;
