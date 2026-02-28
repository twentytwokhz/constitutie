/**
 * AI Comment Moderation via OpenRouter API
 *
 * Uses a language model to evaluate comments for:
 * - Obscene/offensive language
 * - Spam or low-quality content
 * - Personal attacks
 * - Off-topic content
 *
 * When the AI API is unavailable (network error, invalid key, bad response),
 * falls back to a programmatic profanity filter that checks against curated
 * word lists in Romanian and English. This prevents offensive content from
 * slipping through during API outages.
 *
 * Returns an approval/rejection decision with a reason in Romanian.
 */

import { checkProfanity } from "./profanity-filter";

interface ModerationResult {
  approved: boolean;
  reason: string | null;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `Ești un moderator automat de comentarii pentru o platformă educațională despre Constituția României.

Evaluează comentariul primit și decide dacă trebuie aprobat sau respins.

RESPINGE comentariul dacă conține:
- Limbaj obscen, vulgar sau ofensator
- Atacuri la persoană sau discurs instigator la ură
- Spam, reclame sau conținut irelevant
- Conținut extrem de scurt sau fără sens (sub 3 cuvinte cu sens)
- Amenințări sau incitare la violență

APROBĂ comentariul dacă:
- Este constructiv, chiar dacă critic
- Exprimă o opinie civilizată despre un articol constituțional
- Pune întrebări legitime despre legislație
- Oferă perspective sau interpretări relevante

Răspunde DOAR cu un obiect JSON valid, fără alt text:
{"approved": true, "reason": null}
sau
{"approved": false, "reason": "Motivul specific al respingerii în limba română"}`;

/**
 * Fallback moderation using the programmatic profanity filter.
 * Called when the OpenRouter AI API is unavailable or returns invalid data.
 */
function fallbackModeration(commentContent: string, reason: string): ModerationResult {
  console.warn(`[moderation] Falling back to profanity filter: ${reason}`);
  const profanityCheck = checkProfanity(commentContent);
  if (profanityCheck.flagged) {
    return { approved: false, reason: profanityCheck.reason };
  }
  // No profanity detected — approve the comment
  return { approved: true, reason: null };
}

/**
 * Moderate a comment using OpenRouter AI.
 * Falls back to a programmatic profanity word-list filter if the API
 * is unavailable, returns an error, or produces invalid output.
 * This ensures offensive content is always caught, even during outages.
 */
export async function moderateComment(commentContent: string): Promise<ModerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.includes("placeholder") || apiKey.includes("xxxx")) {
    console.warn("[moderation] No valid OpenRouter API key configured, using profanity filter");
    return fallbackModeration(commentContent, "no API key");
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://constitutia-romaniei.vercel.app",
        "X-Title": "Constitutia Romaniei - Comment Moderation",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Evaluează acest comentariu:\n\n"${commentContent}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error(`[moderation] OpenRouter API error: ${response.status} ${response.statusText}`);
      return fallbackModeration(commentContent, `API returned ${response.status}`);
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      console.error("[moderation] Empty response from OpenRouter");
      return fallbackModeration(commentContent, "empty API response");
    }

    // Parse the JSON response from the AI (handle markdown code blocks)
    const jsonStr = messageContent
      .replace(/```json?\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const result = JSON.parse(jsonStr);

    if (typeof result.approved !== "boolean") {
      console.error("[moderation] Invalid moderation response format:", result);
      return fallbackModeration(commentContent, "invalid response format");
    }

    return {
      approved: result.approved,
      reason: result.approved
        ? null
        : result.reason || "Comentariul nu respectă regulile platformei.",
    };
  } catch (error) {
    console.error("[moderation] Error during comment moderation:", error);
    return fallbackModeration(commentContent, "exception thrown");
  }
}
