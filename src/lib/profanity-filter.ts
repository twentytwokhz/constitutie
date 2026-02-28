/**
 * Programmatic profanity filter for Romanian and English content.
 *
 * Used as a fallback when the OpenRouter AI moderation API is unavailable.
 * Checks comment text against curated word lists using case-insensitive
 * word-boundary matching. Also detects common obfuscation patterns
 * (e.g., replacing letters with numbers or symbols).
 *
 * This is a best-effort filter — it cannot replace the nuance of AI moderation,
 * but it catches the most common forms of offensive language.
 */

interface ProfanityResult {
  flagged: boolean;
  reason: string | null;
}

// ────────────────────────────────────────────────────────────────
// Romanian profanity / offensive terms
// ────────────────────────────────────────────────────────────────
const ROMANIAN_PROFANITY: string[] = [
  // Common vulgar terms and their variations
  "pula",
  "pule",
  "pulă",
  "pulii",
  "pizdă",
  "pizda",
  "pizde",
  "pizdei",
  "fut",
  "futu",
  "fute",
  "futut",
  "futea",
  "futere",
  "futuți",
  "futui",
  "muie",
  "muia",
  "muist",
  "muiștă",
  "cur",
  "curul",
  "curva",
  "curvă",
  "curve",
  "curvei",
  "căcat",
  "cacat",
  "cacatul",
  "rahat",
  "rahatul",
  "coaie",
  "coaiele",
  "coaie",
  "labă",
  "laba",
  "labagiu",
  "bulangiu",
  "bulangii",
  "bulangiului",
  "sugipula",
  "sugi pula",
  "dracului",
  "dracu",
  "împuțit",
  "imputit",
  "impuțit",
  "retardat",
  "retardată",
  "retardați",
  "idiot",
  "idioată",
  "idioți",
  "idioata",
  "imbecil",
  "imbecilă",
  "imbecili",
  "cretin",
  "cretină",
  "cretini",
  "prost",
  "proastă",
  "proști",
  "prostie",
  "prostii",
  "proasta",
  "tâmpit",
  "tampit",
  "tâmpită",
  "tampita",
  "nenorocit",
  "nenorocită",
  "nenorociți",
  "handicapat",
  "handicapată",
  "handicapați",
  "javră",
  "javra",
  "lighioană",
  "lighioana",
  "jigodie",
  "jigodii",
  "mârlan",
  "marlan",
  "mârlani",
  "bou",
  "boul",
  "dobitoc",
  "dobitoci",
  "gunoi",
  "gunoaie",
  "porc",
  "porci",
  "porcărie",
  "animal",
  "animale",
  "suge",
  "sugi",
  "linge",
  "lingi",
  "sloboz",
  "slobozi",
  "orgasm",
  "penis",
  "vagin",
  "ejaculare",
  "masturbare",
  "prostituată",
  "prostituata",
  "prostituat",
  "bagamias",
  "bagamiaș",
  "baga-mi-as",
  "mamata",
  "mă-ta",
  "mata",
  "tactu",
  "tac-tu",
  "taică-tu",
  "morții",
  "mortii",
  "morți",
  "dumnezeilor",
  "cretinism",
];

// ────────────────────────────────────────────────────────────────
// English profanity / offensive terms
// ────────────────────────────────────────────────────────────────
const ENGLISH_PROFANITY: string[] = [
  // Common English swear words
  "fuck",
  "fucker",
  "fucked",
  "fucking",
  "motherfucker",
  "motherfucking",
  "shit",
  "shitty",
  "bullshit",
  "shithead",
  "dipshit",
  "ass",
  "asshole",
  "arsehole",
  "arse",
  "bitch",
  "bitchy",
  "bitches",
  "damn",
  "damned",
  "goddamn",
  "dick",
  "dickhead",
  "cock",
  "cocksucker",
  "cunt",
  "cunts",
  "bastard",
  "bastards",
  "whore",
  "whores",
  "slut",
  "sluts",
  "retard",
  "retarded",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "pussy",
  "wanker",
  "wank",
  "twat",
  "prick",
  "bollocks",
  "bugger",
  "crap",
  "crappy",
  "jerk",
  "jackass",
  "dumbass",
  "moron",
  "moronic",
  "idiot",
  "idiotic",
  "imbecile",
  "scumbag",
  "suck",
  "sucker",
  "piss",
  "pissed",
  "penis",
  "vagina",
  "ejaculate",
  "masturbate",
  "prostitute",
  "porn",
  "porno",
  "pornography",
];

// ────────────────────────────────────────────────────────────────
// Hate speech / violence keywords (both languages)
// ────────────────────────────────────────────────────────────────
const HATE_AND_VIOLENCE: string[] = [
  // Romanian
  "omorâ",
  "omoara",
  "ucide",
  "ucidere",
  "sinucide",
  "sinucidere",
  "atac terorist",
  "terorism",
  "terorist",
  "nazist",
  "nazism",
  "fascist",
  "fascism",
  "holocaust",
  "rasist",
  "rasism",
  "antisemit",
  "antisemitism",
  "xenofob",
  "xenofobie",
  "homofobie",
  "homofob",
  "genocid",
  // English
  "kill",
  "murder",
  "terrorist",
  "terrorism",
  "nazi",
  "fascist",
  "racist",
  "racism",
  "xenophobe",
  "xenophobia",
  "homophobe",
  "homophobia",
  "genocide",
  "suicide",
  "bomb",
  "bombing",
];

// ────────────────────────────────────────────────────────────────
// Common character substitution map (l33t speak / obfuscation)
// ────────────────────────────────────────────────────────────────
const CHAR_SUBSTITUTIONS: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "@": "a",
  $: "s",
  "5": "s",
  "7": "t",
  "!": "i",
  "+": "t",
  "|": "l",
};

/**
 * Normalize text for matching:
 * - Lowercase
 * - Replace common character substitutions (l33tspeak)
 * - Remove repeated characters (e.g., "fuuuuck" → "fuck")
 * - Normalize Romanian diacritics to ASCII equivalents
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Replace l33tspeak substitutions
  for (const [char, replacement] of Object.entries(CHAR_SUBSTITUTIONS)) {
    normalized = normalized.replaceAll(char, replacement);
  }

  // Normalize Romanian diacritics
  normalized = normalized
    .replaceAll("ă", "a")
    .replaceAll("â", "a")
    .replaceAll("î", "i")
    .replaceAll("ș", "s")
    .replaceAll("ş", "s")
    .replaceAll("ț", "t")
    .replaceAll("ţ", "t");

  // Collapse repeated characters (3+ → single, to catch "fuuuuck" etc.)
  normalized = normalized.replace(/(.)\1{2,}/g, "$1");

  // Remove common separator characters used to evade filters (e.g., "f.u.c.k")
  normalized = normalized.replace(/[.\-_*~`]/g, "");

  return normalized;
}

/**
 * Check if a word from the profanity list appears in the normalized text.
 * Uses word-boundary-aware matching to reduce false positives
 * (e.g., "class" should not match "ass").
 */
function containsProfanity(normalizedText: string, wordList: string[]): string | null {
  for (const word of wordList) {
    const normalizedWord = normalizeText(word);
    // Use word boundary regex: \b matches word boundaries
    // This prevents "class" from matching "ass", "assume" from matching "ass", etc.
    const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, "i");
    if (regex.test(normalizedText)) {
      return word;
    }
  }
  return null;
}

/**
 * Check for multi-word hate/violence phrases in the text.
 * These are checked as substrings (no word boundary) since they
 * are specific enough to not cause false positives.
 */
function containsHateSpeech(normalizedText: string): string | null {
  for (const phrase of HATE_AND_VIOLENCE) {
    const normalizedPhrase = normalizeText(phrase);
    if (normalizedPhrase.includes(" ")) {
      // Multi-word phrase: check as substring
      if (normalizedText.includes(normalizedPhrase)) {
        return phrase;
      }
    } else {
      // Single word: use word boundary
      const regex = new RegExp(`\\b${escapeRegex(normalizedPhrase)}\\b`, "i");
      if (regex.test(normalizedText)) {
        return phrase;
      }
    }
  }
  return null;
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Run the programmatic profanity filter on a comment.
 *
 * This is a fallback for when the OpenRouter AI moderation API is unavailable.
 * It checks for:
 * 1. Romanian profanity/slurs
 * 2. English profanity/slurs
 * 3. Hate speech and violence-related terms
 * 4. Common obfuscation patterns (l33tspeak, separators, repeated chars)
 *
 * Returns { flagged: false } for clean comments, or
 * { flagged: true, reason: "..." } for comments that should be rejected.
 */
export function checkProfanity(text: string): ProfanityResult {
  const normalizedText = normalizeText(text);

  // Check Romanian profanity
  const roMatch = containsProfanity(normalizedText, ROMANIAN_PROFANITY);
  if (roMatch) {
    return {
      flagged: true,
      reason: "Comentariul conține limbaj vulgar sau ofensator.",
    };
  }

  // Check English profanity
  const enMatch = containsProfanity(normalizedText, ENGLISH_PROFANITY);
  if (enMatch) {
    return {
      flagged: true,
      reason: "Comentariul conține limbaj vulgar sau ofensator.",
    };
  }

  // Check hate speech / violence
  const hateMatch = containsHateSpeech(normalizedText);
  if (hateMatch) {
    return {
      flagged: true,
      reason: "Comentariul conține limbaj instigator la ură sau violență.",
    };
  }

  // No profanity detected — safe to approve
  return { flagged: false, reason: null };
}
