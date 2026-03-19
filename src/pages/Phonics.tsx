import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Home, ChevronRight, Star, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSession } from "@/contexts/SessionContext";
import Footer from "@/components/Footer";

interface WordExample {
  word: string;
  highlight: string;
  emoji: string;
}

interface PhonicsPattern {
  letters: string;
  soundsLike: string;
  pronunciation: string;
  examples: WordExample[];
  tip: string;
}

interface BlendingWord {
  word: string;
  sounds: string[];
  emoji: string;
}

interface PhonicsCategory {
  id: string;
  title: string;
  description: string;
  emoji: string;
  patterns?: PhonicsPattern[];
  blendingWords?: BlendingWord[];
  isBlending?: boolean;
}

const phonicsData: PhonicsCategory[] = [
  // ── STEP 1: Phonemic Awareness ──
  {
    id: "phonemic-awareness",
    title: "Hearing Sounds",
    description: "Listen carefully — can you hear the sounds in words?",
    emoji: "👂",
    patterns: [
      {
        letters: "Beginning Sounds",
        soundsLike: "What sound does the word START with?",
        pronunciation: "buh, as in ball",
        examples: [
          { word: "ball", highlight: "b", emoji: "⚽" },
          { word: "bat", highlight: "b", emoji: "🦇" },
          { word: "box", highlight: "b", emoji: "📦" },
        ],
        tip: "Listen to the FIRST sound. Ball, bat, box all start with the same sound!",
      },
      {
        letters: "Ending Sounds",
        soundsLike: "What sound does the word END with?",
        pronunciation: "tuh, as in cat",
        examples: [
          { word: "cat", highlight: "t", emoji: "🐱" },
          { word: "hat", highlight: "t", emoji: "🎩" },
          { word: "bat", highlight: "t", emoji: "🏏" },
        ],
        tip: "Listen to the LAST sound. Cat, hat, bat all end with the same sound!",
      },
      {
        letters: "Rhyming Words",
        soundsLike: "Words that sound alike at the end",
        pronunciation: "at, as in cat, hat, mat",
        examples: [
          { word: "cat", highlight: "at", emoji: "🐱" },
          { word: "hat", highlight: "at", emoji: "🎩" },
          { word: "mat", highlight: "at", emoji: "🧹" },
        ],
        tip: "Rhyming words share the same ending sound. Cat, hat, mat — they all rhyme!",
      },
    ],
  },

  // ── STEP 2: Consonant Sounds ──
  {
    id: "consonants",
    title: "Consonant Sounds",
    description: "Learn the sound each consonant letter makes",
    emoji: "🔤",
    patterns: [
      { letters: "B", soundsLike: "buh", pronunciation: "buh, as in ball", examples: [{ word: "ball", highlight: "b", emoji: "⚽" }, { word: "bed", highlight: "b", emoji: "🛏️" }, { word: "bus", highlight: "b", emoji: "🚌" }], tip: "Press your lips together, then pop them open!" },
      { letters: "C", soundsLike: "kuh", pronunciation: "kuh, as in cat", examples: [{ word: "cat", highlight: "c", emoji: "🐱" }, { word: "cup", highlight: "c", emoji: "☕" }, { word: "car", highlight: "c", emoji: "🚗" }], tip: "Hard C sounds like K. Say it in the back of your throat." },
      { letters: "D", soundsLike: "duh", pronunciation: "duh, as in dog", examples: [{ word: "dog", highlight: "d", emoji: "🐕" }, { word: "door", highlight: "d", emoji: "🚪" }, { word: "duck", highlight: "d", emoji: "🦆" }], tip: "Touch your tongue behind your top teeth!" },
      { letters: "F", soundsLike: "fff", pronunciation: "fuh, as in fish", examples: [{ word: "fish", highlight: "f", emoji: "🐟" }, { word: "fan", highlight: "f", emoji: "🌀" }, { word: "frog", highlight: "f", emoji: "🐸" }], tip: "Bite your bottom lip gently and blow air." },
      { letters: "G", soundsLike: "guh", pronunciation: "guh, as in go", examples: [{ word: "go", highlight: "g", emoji: "🏃" }, { word: "game", highlight: "g", emoji: "🎮" }, { word: "goat", highlight: "g", emoji: "🐐" }], tip: "Feel the sound in the back of your throat." },
      { letters: "H", soundsLike: "huh", pronunciation: "huh, as in hat", examples: [{ word: "hat", highlight: "h", emoji: "🎩" }, { word: "hot", highlight: "h", emoji: "🔥" }, { word: "house", highlight: "h", emoji: "🏠" }], tip: "Like you're breathing on a window to fog it up!" },
      { letters: "J", soundsLike: "juh", pronunciation: "juh, as in jump", examples: [{ word: "jump", highlight: "j", emoji: "🤸" }, { word: "jam", highlight: "j", emoji: "🍯" }, { word: "jet", highlight: "j", emoji: "✈️" }], tip: "Your tongue touches the roof of your mouth, then drops." },
      { letters: "K", soundsLike: "kuh", pronunciation: "kuh, as in kite", examples: [{ word: "kite", highlight: "k", emoji: "🪁" }, { word: "king", highlight: "k", emoji: "👑" }, { word: "key", highlight: "k", emoji: "🔑" }], tip: "Same sound as hard C — from the back of your throat." },
      { letters: "L", soundsLike: "lll", pronunciation: "luh, as in lion", examples: [{ word: "lion", highlight: "l", emoji: "🦁" }, { word: "lamp", highlight: "l", emoji: "💡" }, { word: "leaf", highlight: "l", emoji: "🍃" }], tip: "Tongue tip touches behind your top teeth and stays." },
      { letters: "M", soundsLike: "mmm", pronunciation: "muh, as in moon", examples: [{ word: "moon", highlight: "m", emoji: "🌙" }, { word: "map", highlight: "m", emoji: "🗺️" }, { word: "milk", highlight: "m", emoji: "🥛" }], tip: "Close your lips and hum — mmmmm!" },
      { letters: "N", soundsLike: "nnn", pronunciation: "nuh, as in nest", examples: [{ word: "nest", highlight: "n", emoji: "🪺" }, { word: "nut", highlight: "n", emoji: "🥜" }, { word: "nose", highlight: "n", emoji: "👃" }], tip: "Tongue behind top teeth, air through your nose." },
      { letters: "P", soundsLike: "puh", pronunciation: "puh, as in pig", examples: [{ word: "pig", highlight: "p", emoji: "🐷" }, { word: "pen", highlight: "p", emoji: "🖊️" }, { word: "pizza", highlight: "p", emoji: "🍕" }], tip: "Like B but with a puff of air — no vibration!" },
      { letters: "R", soundsLike: "rrr", pronunciation: "ruh, as in rain", examples: [{ word: "rain", highlight: "r", emoji: "🌧️" }, { word: "red", highlight: "r", emoji: "🔴" }, { word: "robot", highlight: "r", emoji: "🤖" }], tip: "Curl your tongue back — don't let it touch anything!" },
      { letters: "S", soundsLike: "sss", pronunciation: "suh, as in sun", examples: [{ word: "sun", highlight: "s", emoji: "☀️" }, { word: "star", highlight: "s", emoji: "⭐" }, { word: "snake", highlight: "s", emoji: "🐍" }], tip: "Like a snake hissing — sssssss!" },
      { letters: "T", soundsLike: "tuh", pronunciation: "tuh, as in tree", examples: [{ word: "tree", highlight: "t", emoji: "🌳" }, { word: "top", highlight: "t", emoji: "🔝" }, { word: "tiger", highlight: "t", emoji: "🐯" }], tip: "Quick tap of your tongue behind your top teeth." },
      { letters: "V", soundsLike: "vvv", pronunciation: "vuh, as in van", examples: [{ word: "van", highlight: "v", emoji: "🚐" }, { word: "violin", highlight: "v", emoji: "🎻" }, { word: "vest", highlight: "v", emoji: "🦺" }], tip: "Like F but with a buzzy vibration!" },
      { letters: "W", soundsLike: "wuh", pronunciation: "wuh, as in water", examples: [{ word: "water", highlight: "w", emoji: "💧" }, { word: "wind", highlight: "w", emoji: "💨" }, { word: "worm", highlight: "w", emoji: "🪱" }], tip: "Round your lips like you're about to whistle." },
      { letters: "X", soundsLike: "ks", pronunciation: "ks, as in fox", examples: [{ word: "fox", highlight: "x", emoji: "🦊" }, { word: "box", highlight: "x", emoji: "📦" }, { word: "six", highlight: "x", emoji: "6️⃣" }], tip: "Two sounds mashed together — K then S!" },
      { letters: "Y", soundsLike: "yuh", pronunciation: "yuh, as in yes", examples: [{ word: "yes", highlight: "y", emoji: "✅" }, { word: "yo-yo", highlight: "y", emoji: "🪀" }, { word: "yak", highlight: "y", emoji: "🐂" }], tip: "Tongue rises to the roof of your mouth." },
      { letters: "Z", soundsLike: "zzz", pronunciation: "zuh, as in zoo", examples: [{ word: "zoo", highlight: "z", emoji: "🦓" }, { word: "zip", highlight: "z", emoji: "🤐" }, { word: "zero", highlight: "z", emoji: "0️⃣" }], tip: "Like S but buzzy — feel your throat vibrate!" },
    ],
  },

  // ── STEP 3: Short Vowel Sounds ──
  {
    id: "short-vowels",
    title: "Short Vowel Sounds",
    description: "Every word needs a vowel — learn their short sounds",
    emoji: "🅰️",
    patterns: [
      { letters: "A", soundsLike: "ah (like in cat)", pronunciation: "ah", examples: [{ word: "cat", highlight: "a", emoji: "🐱" }, { word: "bat", highlight: "a", emoji: "🏏" }, { word: "map", highlight: "a", emoji: "🗺️" }], tip: "Open your mouth wide, like at the doctor!" },
      { letters: "E", soundsLike: "eh (like in bed)", pronunciation: "eh", examples: [{ word: "bed", highlight: "e", emoji: "🛏️" }, { word: "red", highlight: "e", emoji: "🔴" }, { word: "hen", highlight: "e", emoji: "🐔" }], tip: "Smile a little bit — your mouth is slightly open." },
      { letters: "I", soundsLike: "ih (like in pig)", pronunciation: "ih", examples: [{ word: "pig", highlight: "i", emoji: "🐷" }, { word: "sit", highlight: "i", emoji: "🪑" }, { word: "fin", highlight: "i", emoji: "🐟" }], tip: "Quick, short sound — lips barely move!" },
      { letters: "O", soundsLike: "oh (like in dog)", pronunciation: "ah", examples: [{ word: "dog", highlight: "o", emoji: "🐕" }, { word: "hot", highlight: "o", emoji: "🔥" }, { word: "top", highlight: "o", emoji: "🔝" }], tip: "Round your lips like a little circle." },
      { letters: "U", soundsLike: "uh (like in cup)", pronunciation: "uh", examples: [{ word: "cup", highlight: "u", emoji: "☕" }, { word: "bug", highlight: "u", emoji: "🐛" }, { word: "sun", highlight: "u", emoji: "☀️" }], tip: "Like you're thinking... 'uh...'" },
    ],
  },

  // ── STEP 4: CVC Blending Practice ──
  {
    id: "blending",
    title: "Blend It! (CVC Words)",
    description: "Put sounds together to make real words!",
    emoji: "🧩",
    isBlending: true,
    blendingWords: [
      { word: "cat", sounds: ["c", "a", "t"], emoji: "🐱" },
      { word: "dog", sounds: ["d", "o", "g"], emoji: "🐕" },
      { word: "sun", sounds: ["s", "u", "n"], emoji: "☀️" },
      { word: "pig", sounds: ["p", "i", "g"], emoji: "🐷" },
      { word: "hat", sounds: ["h", "a", "t"], emoji: "🎩" },
      { word: "bed", sounds: ["b", "e", "d"], emoji: "🛏️" },
      { word: "cup", sounds: ["c", "u", "p"], emoji: "☕" },
      { word: "fox", sounds: ["f", "o", "x"], emoji: "🦊" },
      { word: "bug", sounds: ["b", "u", "g"], emoji: "🐛" },
      { word: "hen", sounds: ["h", "e", "n"], emoji: "🐔" },
      { word: "map", sounds: ["m", "a", "p"], emoji: "🗺️" },
      { word: "nut", sounds: ["n", "u", "t"], emoji: "🥜" },
      { word: "red", sounds: ["r", "e", "d"], emoji: "🔴" },
      { word: "van", sounds: ["v", "a", "n"], emoji: "🚐" },
      { word: "zip", sounds: ["z", "i", "p"], emoji: "🤐" },
      { word: "jam", sounds: ["j", "a", "m"], emoji: "🍯" },
      { word: "kit", sounds: ["k", "i", "t"], emoji: "🧰" },
      { word: "log", sounds: ["l", "o", "g"], emoji: "🪵" },
      { word: "wet", sounds: ["w", "e", "t"], emoji: "💧" },
      { word: "top", sounds: ["t", "o", "p"], emoji: "🔝" },
    ],
  },

  // ── STEP 5: Consonant Digraphs ──
  {
    id: "consonant-digraphs",
    title: "Letter Teams (Digraphs)",
    description: "Two letters that make ONE new sound",
    emoji: "🤝",
    patterns: [
      { letters: "SH", soundsLike: "shh (like 'be quiet!')", pronunciation: "shuh, as in ship", examples: [{ word: "ship", highlight: "sh", emoji: "🚢" }, { word: "fish", highlight: "sh", emoji: "🐟" }, { word: "shell", highlight: "sh", emoji: "🐚" }], tip: "Put your finger to your lips — shhhh!" },
      { letters: "CH", soundsLike: "ch (like a train!)", pronunciation: "chuh, as in chip", examples: [{ word: "chip", highlight: "ch", emoji: "🍟" }, { word: "lunch", highlight: "ch", emoji: "🍱" }, { word: "chair", highlight: "ch", emoji: "🪑" }], tip: "Starts with your tongue on the roof of your mouth." },
      { letters: "TH", soundsLike: "th (tongue between teeth)", pronunciation: "thuh, as in this", examples: [{ word: "this", highlight: "th", emoji: "👉" }, { word: "bath", highlight: "th", emoji: "🛁" }, { word: "think", highlight: "th", emoji: "🤔" }], tip: "Stick your tongue out slightly between your teeth!" },
      { letters: "WH", soundsLike: "wh (like blowing air)", pronunciation: "wuh, as in what", examples: [{ word: "what", highlight: "wh", emoji: "❓" }, { word: "whale", highlight: "wh", emoji: "🐋" }, { word: "wheel", highlight: "wh", emoji: "🎡" }], tip: "Round your lips and blow gently, then add a sound." },
      { letters: "PH", soundsLike: "f (sounds just like F!)", pronunciation: "fuh, as in phone", examples: [{ word: "phone", highlight: "ph", emoji: "📱" }, { word: "photo", highlight: "ph", emoji: "📸" }, { word: "elephant", highlight: "ph", emoji: "🐘" }], tip: "Surprise! PH makes the same sound as F." },
      { letters: "CK", soundsLike: "k (quick, sharp)", pronunciation: "kuh, as in duck", examples: [{ word: "duck", highlight: "ck", emoji: "🦆" }, { word: "sock", highlight: "ck", emoji: "🧦" }, { word: "kick", highlight: "ck", emoji: "🦶" }], tip: "CK always comes after a short vowel sound." },
      { letters: "NG", soundsLike: "ng (like in sing)", pronunciation: "ng, as in ring", examples: [{ word: "ring", highlight: "ng", emoji: "💍" }, { word: "song", highlight: "ng", emoji: "🎵" }, { word: "king", highlight: "ng", emoji: "👑" }], tip: "Feel the buzz in the back of your throat!" },
    ],
  },

  // ── STEP 6: Consonant Blends ──
  {
    id: "consonant-blends",
    title: "Consonant Blends",
    description: "Two letters that BLEND — you hear both sounds",
    emoji: "🎵",
    patterns: [
      { letters: "BL", soundsLike: "bl (b + l together)", pronunciation: "bluh, as in blue", examples: [{ word: "blue", highlight: "bl", emoji: "🔵" }, { word: "block", highlight: "bl", emoji: "🧱" }, { word: "blanket", highlight: "bl", emoji: "🛏️" }], tip: "Say B then L quickly — they overlap!" },
      { letters: "BR", soundsLike: "br (b + r together)", pronunciation: "bruh, as in brown", examples: [{ word: "brown", highlight: "br", emoji: "🟤" }, { word: "bread", highlight: "br", emoji: "🍞" }, { word: "brush", highlight: "br", emoji: "🖌️" }], tip: "Feel both the B pop and the R rumble." },
      { letters: "CL", soundsLike: "cl (c + l together)", pronunciation: "cluh, as in clap", examples: [{ word: "clap", highlight: "cl", emoji: "👏" }, { word: "cloud", highlight: "cl", emoji: "☁️" }, { word: "clock", highlight: "cl", emoji: "🕐" }], tip: "The C sound slides right into the L." },
      { letters: "CR", soundsLike: "cr (c + r together)", pronunciation: "cruh, as in crab", examples: [{ word: "crab", highlight: "cr", emoji: "🦀" }, { word: "cry", highlight: "cr", emoji: "😢" }, { word: "crown", highlight: "cr", emoji: "👑" }], tip: "Quick K sound then roll into R." },
      { letters: "FL", soundsLike: "fl (f + l together)", pronunciation: "fluh, as in flag", examples: [{ word: "flag", highlight: "fl", emoji: "🏳️" }, { word: "fly", highlight: "fl", emoji: "🪰" }, { word: "flower", highlight: "fl", emoji: "🌸" }], tip: "Blow air for F, then glide to L." },
      { letters: "ST", soundsLike: "st (s + t together)", pronunciation: "stuh, as in star", examples: [{ word: "star", highlight: "st", emoji: "⭐" }, { word: "stop", highlight: "st", emoji: "🛑" }, { word: "stone", highlight: "st", emoji: "🪨" }], tip: "Hiss the S then tap the T." },
      { letters: "TR", soundsLike: "tr (t + r together)", pronunciation: "truh, as in tree", examples: [{ word: "tree", highlight: "tr", emoji: "🌳" }, { word: "train", highlight: "tr", emoji: "🚂" }, { word: "truck", highlight: "tr", emoji: "🚛" }], tip: "Quick T then flow into R." },
      { letters: "SN", soundsLike: "sn (s + n together)", pronunciation: "snuh, as in snake", examples: [{ word: "snake", highlight: "sn", emoji: "🐍" }, { word: "snow", highlight: "sn", emoji: "❄️" }, { word: "snail", highlight: "sn", emoji: "🐌" }], tip: "Hiss the S, then nose-hum the N." },
    ],
  },

  // ── STEP 7: Long Vowel Teams ──
  {
    id: "long-vowels",
    title: "Long Vowel Teams",
    description: "When two vowels walk, the first one talks!",
    emoji: "🗣️",
    patterns: [
      { letters: "AI / AY", soundsLike: "long A (says its name!)", pronunciation: "ay, as in rain", examples: [{ word: "rain", highlight: "ai", emoji: "🌧️" }, { word: "play", highlight: "ay", emoji: "🎮" }, { word: "train", highlight: "ai", emoji: "🚂" }], tip: "AI in the middle, AY at the end of a word." },
      { letters: "EA / EE", soundsLike: "long E (says its name!)", pronunciation: "ee, as in tree", examples: [{ word: "read", highlight: "ea", emoji: "📖" }, { word: "tree", highlight: "ee", emoji: "🌳" }, { word: "beach", highlight: "ea", emoji: "🏖️" }], tip: "Both make the same 'ee' sound — smile wide!" },
      { letters: "OA / OW", soundsLike: "long O (says its name!)", pronunciation: "oh, as in boat", examples: [{ word: "boat", highlight: "oa", emoji: "⛵" }, { word: "snow", highlight: "ow", emoji: "❄️" }, { word: "road", highlight: "oa", emoji: "🛤️" }], tip: "OA in the middle, OW at the end." },
      { letters: "OO", soundsLike: "oo (like in moon)", pronunciation: "oo, as in moon", examples: [{ word: "moon", highlight: "oo", emoji: "🌙" }, { word: "food", highlight: "oo", emoji: "🍔" }, { word: "boot", highlight: "oo", emoji: "🥾" }], tip: "Round your lips into a tiny O shape." },
      { letters: "OU / OW", soundsLike: "ow (like 'ouch!')", pronunciation: "ow, as in house", examples: [{ word: "house", highlight: "ou", emoji: "🏠" }, { word: "cow", highlight: "ow", emoji: "🐄" }, { word: "loud", highlight: "ou", emoji: "📢" }], tip: "Start with 'ah' and slide to 'oo'." },
    ],
  },

  // ── STEP 8: Bossy R ──
  {
    id: "r-controlled",
    title: "Bossy R Vowels",
    description: "When R comes after a vowel, it changes the sound!",
    emoji: "💪",
    patterns: [
      { letters: "AR", soundsLike: "ar (like a pirate: arrr!)", pronunciation: "ar, as in car", examples: [{ word: "car", highlight: "ar", emoji: "🚗" }, { word: "star", highlight: "ar", emoji: "⭐" }, { word: "farm", highlight: "ar", emoji: "🌾" }], tip: "Open wide and growl like a pirate! Arrr!" },
      { letters: "ER", soundsLike: "er (like 'her')", pronunciation: "er, as in her", examples: [{ word: "her", highlight: "er", emoji: "👩" }, { word: "water", highlight: "er", emoji: "💧" }, { word: "flower", highlight: "er", emoji: "🌸" }], tip: "ER, IR, and UR all sound the same!" },
      { letters: "IR", soundsLike: "er (like 'bird')", pronunciation: "ir, as in bird", examples: [{ word: "bird", highlight: "ir", emoji: "🐦" }, { word: "girl", highlight: "ir", emoji: "👧" }, { word: "shirt", highlight: "ir", emoji: "👕" }], tip: "Same sound as ER — just spelled differently." },
      { letters: "OR", soundsLike: "or (like 'more')", pronunciation: "or, as in corn", examples: [{ word: "corn", highlight: "or", emoji: "🌽" }, { word: "horse", highlight: "or", emoji: "🐴" }, { word: "fork", highlight: "or", emoji: "🍴" }], tip: "Round your lips and add a growl." },
      { letters: "UR", soundsLike: "er (like 'fur')", pronunciation: "ur, as in fur", examples: [{ word: "fur", highlight: "ur", emoji: "🧸" }, { word: "turn", highlight: "ur", emoji: "↩️" }, { word: "burn", highlight: "ur", emoji: "🔥" }], tip: "Same as ER and IR — English is tricky!" },
    ],
  },

  // ── STEP 9: Silent Letters ──
  {
    id: "silent-letters",
    title: "Sneaky Silent Letters",
    description: "These letters are there but you DON'T say them!",
    emoji: "🤫",
    patterns: [
      { letters: "KN", soundsLike: "n (the K is silent!)", pronunciation: "nuh, as in know", examples: [{ word: "know", highlight: "kn", emoji: "🧠" }, { word: "knee", highlight: "kn", emoji: "🦵" }, { word: "knife", highlight: "kn", emoji: "🔪" }], tip: "Ignore the K completely — just say N." },
      { letters: "WR", soundsLike: "r (the W is silent!)", pronunciation: "ruh, as in write", examples: [{ word: "write", highlight: "wr", emoji: "✍️" }, { word: "wrong", highlight: "wr", emoji: "❌" }, { word: "wrap", highlight: "wr", emoji: "🎁" }], tip: "The W is just decoration — say R." },
      { letters: "GN", soundsLike: "n (the G is silent!)", pronunciation: "nuh, as in sign", examples: [{ word: "gnaw", highlight: "gn", emoji: "🦷" }, { word: "gnat", highlight: "gn", emoji: "🦟" }, { word: "sign", highlight: "gn", emoji: "🪧" }], tip: "Skip the G — it's hiding!" },
      { letters: "MB", soundsLike: "m (the B is silent!)", pronunciation: "muh, as in lamb", examples: [{ word: "lamb", highlight: "mb", emoji: "🐑" }, { word: "climb", highlight: "mb", emoji: "🧗" }, { word: "thumb", highlight: "mb", emoji: "👍" }], tip: "The B at the end is completely silent." },
    ],
  },
];

// ── Blending Practice Component ──
const BlendingPractice = ({
  words,
  speak,
  speakAsync,
  isSupported,
}: {
  words: BlendingWord[];
  speak: (text: string, rate?: number, pitch?: number) => void;
  speakAsync: (text: string, rate?: number, pitch?: number) => Promise<void>;
  isSupported: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<"ready" | "sounding" | "blended">("ready");
  const [activeSoundIndex, setActiveSoundIndex] = useState(-1);

  const current = words[currentIndex];

  const handleSoundOut = useCallback(async () => {
    if (!isSupported) return;
    setStep("sounding");

    for (let i = 0; i < current.sounds.length; i++) {
      setActiveSoundIndex(i);
      await speakAsync(current.sounds[i], 0.4, 1.0);
      await new Promise((r) => setTimeout(r, 500));
    }

    setActiveSoundIndex(-1);
    await new Promise((r) => setTimeout(r, 300));
    setStep("blended");
    speak(current.word, 0.6, 0.9);
  }, [current, speak, speakAsync, isSupported]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % words.length);
    setStep("ready");
    setActiveSoundIndex(-1);
  };

  const handleSayWord = () => {
    speak(current.word, 0.6, 0.9);
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground">
          <strong>How blending works:</strong> Tap "Sound it out" to hear each letter sound slowly, 
          then hear them blend together into a real word!
        </p>
      </div>

      <div className="card-elevated text-center py-8">
        {/* Emoji illustration */}
        <span className="text-6xl block mb-4">{current.emoji}</span>

        {/* Sound blocks */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {current.sounds.map((sound, i) => (
            <div
              key={i}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-display font-bold transition-all duration-300 ${
                activeSoundIndex === i
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                  : step === "blended"
                  ? "bg-success/20 text-success"
                  : "bg-muted text-foreground"
              }`}
            >
              {sound}
            </div>
          ))}
        </div>

        {/* Blended result */}
        {step === "blended" && (
          <div className="fade-in-up mb-4">
            <p className="text-4xl font-display font-bold text-primary">{current.word}</p>
            <p className="text-muted-foreground mt-1">
              {current.sounds.join(" + ")} = {current.word}!
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {step === "ready" && (
            <button
              onClick={handleSoundOut}
              className="btn-hero flex items-center gap-2"
              disabled={!isSupported}
            >
              <Volume2 className="w-5 h-5" />
              Sound It Out
            </button>
          )}
          {step === "blended" && (
            <>
              <button
                onClick={handleSayWord}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg font-semibold"
              >
                <Volume2 className="w-5 h-5" />
                Hear Again
              </button>
              <button
                onClick={() => { setStep("ready"); setActiveSoundIndex(-1); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors text-lg font-semibold"
              >
                <RotateCcw className="w-5 h-5" />
                Replay
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-success text-success-foreground hover:bg-success/90 transition-colors text-lg font-semibold"
              >
                <Play className="w-5 h-5" />
                Next Word
              </button>
            </>
          )}
        </div>

        {/* Progress */}
        <p className="text-sm text-muted-foreground mt-4">
          Word {currentIndex + 1} of {words.length}
        </p>
      </div>
    </div>
  );
};

// ── Main Phonics Page ──
const Phonics = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const { speak, speakAsync, isSupported } = useTextToSpeech();
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
                <strong>Start here!</strong> Go in order from top to bottom. Each category builds on the one before it. 
                Tap sounds to hear them, tap words to hear them spoken. No tests — just listen and learn!
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="font-display font-bold text-foreground text-lg mt-1">
                      {category.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.isBlending
                        ? `${category.blendingWords?.length} words to practice`
                        : `${category.patterns?.length} sounds to learn`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : activeCategory.isBlending && activeCategory.blendingWords ? (
          /* Blending Practice */
          <BlendingPractice
            words={activeCategory.blendingWords}
            speak={speak}
            speakAsync={speakAsync}
            isSupported={isSupported}
          />
        ) : (
          /* Pattern Learning View */
          <div className="space-y-6 fade-in-up">
            {/* Contextual instruction — minimal, one line */}
            <p className="text-sm text-muted-foreground text-center">
              🔊 Tap any <span className="font-semibold text-primary">letter box</span> or <span className="font-semibold text-primary">word</span> to hear it
            </p>

            {activeCategory.patterns?.map((pattern, index) => (
              <div
                key={pattern.letters}
                className="card-elevated fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Letter + Sound Header */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => handlePlaySound(pattern.pronunciation, pattern.letters)}
                    className={`relative flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors group flex-shrink-0 ${
                      index === 0 && !practicedPatterns.has(pattern.letters) ? "animate-[pulse_2s_ease-in-out_3] ring-2 ring-primary/30" : ""
                    }`}
                    aria-label={`Play sound for ${pattern.letters}`}
                  >
                    <span className="text-2xl font-display font-bold text-primary">
                      {pattern.letters}
                    </span>
                    <Volume2 className="absolute bottom-1 right-1 w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                    {practicedPatterns.has(pattern.letters) && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-success fill-background" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-foreground">
                      Sounds like: <span className="text-primary">"{pattern.soundsLike}"</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      💡 {pattern.tip}
                    </p>
                  </div>
                </div>

                {/* Example Words with Emoji */}
                <div className="flex flex-wrap gap-3">
                  {pattern.examples.map((example) => (
                    <button
                      key={example.word}
                      onClick={() => handlePlayWord(example.word)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-lg font-medium min-h-[44px]"
                    >
                      <span className="text-xl">{example.emoji}</span>
                      {highlightWord(example.word, example.highlight)}
                      <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
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
