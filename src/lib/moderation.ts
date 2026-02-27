/**
 * AI Comment Moderation via OpenRouter API
 *
 * Uses a language model to evaluate comments for:
 * - Obscene/offensive language
 * - Spam or low-quality content
 * - Personal attacks
 * - Off-topic content
 *
 * Returns an approval/rejection decision with a reason in Romanian.
 */

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
 * Moderate a comment using OpenRouter AI.
 * Falls back to approval if the API is unavailable or returns an error,
 * to avoid blocking legitimate comments.
 */
export async function moderateComment(commentContent: string): Promise<ModerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.includes("placeholder") || apiKey.includes("xxxx")) {
    // No valid API key — skip moderation, approve by default
    console.warn("[moderation] No valid OpenRouter API key configured, skipping moderation");
    return { approved: true, reason: null };
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
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Evaluează acest comentariu:\n\n"${commentContent}"`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error(`[moderation] OpenRouter API error: ${response.status} ${response.statusText}`);
      // Fail open: approve if API is down
      return { approved: true, reason: null };
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      console.error("[moderation] Empty response from OpenRouter");
      return { approved: true, reason: null };
    }

    // Parse the JSON response from the AI
    const result = JSON.parse(messageContent);

    if (typeof result.approved !== "boolean") {
      console.error("[moderation] Invalid moderation response format:", result);
      return { approved: true, reason: null };
    }

    return {
      approved: result.approved,
      reason: result.approved
        ? null
        : result.reason || "Comentariul nu respectă regulile platformei.",
    };
  } catch (error) {
    console.error("[moderation] Error during comment moderation:", error);
    // Fail open: approve if moderation crashes
    return { approved: true, reason: null };
  }
}
