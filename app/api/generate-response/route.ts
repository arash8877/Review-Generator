import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { reviews } from "@/app/lib/reviews";
import { Tone, Response } from "@/app/lib/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt(
  reviewText: string,
  tone: Tone,
  requestId?: string,
  previousResponse?: string,
  variationSeed?: string
) {
  const previousBlock = previousResponse
    ? `
Previous draft (provide a distinctly different alternative):
"""
${previousResponse}
"""
`.trim()
    : "";

  const adjectives = ["empathetic", "professional", "helpful", "concise", "warm"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  return `
You are a ${randomAdjective} customer-care specialist drafting a reply to a product review.

Tone required: ${tone}
Variation token: ${requestId ?? "primary"}
Variation seed: ${variationSeed ?? "seedless"}
${previousBlock ? `\n${previousBlock}\n` : ""}

Customer review:
"""
${reviewText}
"""

Respond as the brand using the requested tone. Address the customer's key concerns, show accountability, and offer a clear next step when relevant. Keep the response under 180 words.

IMPORTANT: If a previous draft is provided above, you MUST generate a response that is SIGNIFICANTLY different in structure and vocabulary. Do not just swap a few words. Use a completely different opening and closing. The goal is to provide the user with a fresh alternative option.

Important: Return JSON with this shape:
{
  "response": "<final reply as plain text>",
  "keyConcerns": ["<concern 1>", "<concern 2>", "..."] // include 0-3 concise items
}
`.trim();
}

async function callGemini(
  reviewText: string,
  tone: Tone,
  requestId?: string,
  previousResponse?: string,
  attempt = 1
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const variationSeed = randomUUID();

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt(reviewText, tone, requestId, previousResponse, variationSeed),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 1.3,
        top_k: 64,
        top_p: 0.95,
        response_mime_type: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const jsonPayload = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(jsonPayload);
    const aiResponse = (parsed.response as string) ?? "";
    const keyConcerns = Array.isArray(parsed.keyConcerns)
      ? (parsed.keyConcerns as string[])
      : undefined;

    if (!aiResponse) {
      throw new Error("Gemini returned an empty response");
    }

    const trimmedResponse = aiResponse.trim();
    const trimmedPrevious = previousResponse?.trim();

    if (
      previousResponse &&
      trimmedResponse &&
      trimmedPrevious &&
      trimmedResponse.toLowerCase() === trimmedPrevious.toLowerCase() &&
      attempt < 3
    ) {
      console.warn("Gemini returned identical text, retrying with new seed");
      return callGemini(reviewText, tone, randomUUID(), previousResponse, attempt + 1);
    }

    return { text: aiResponse, keyConcerns };
  } catch (error) {
    throw new Error("Failed to parse Gemini response payload");
  }
}

function fallbackResponse(reviewText: string, sentiment: string, tone: Tone): Response {
  const base = `Thanks for taking the time to share your experience.`;
  const apology =
    sentiment === "negative"
      ? " We're sorry to hear things didn't go as expected and we'd like to help make it right."
      : "";
  const close =
    tone === "Formal"
      ? " Kind regards, Customer Care Team."
      : " Please reach out to our support team if there's anything else we can do.";

  return {
    text: `${base}${apology} We appreciate your detailed feedback and are already reviewing it with our product specialists.${close}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, tone, requestId, previousResponse } = body as {
      reviewId?: string;
      tone?: Tone;
      requestId?: string;
      previousResponse?: string;
    };

    console.log("API Request:", {
      reviewId,
      tone,
      requestId,
      hasPreviousResponse: !!previousResponse,
    });
    if (previousResponse) {
      console.log("Previous response length:", previousResponse.length);
      console.log("Previous response preview:", previousResponse.substring(0, 50));
    }

    if (!reviewId || !tone) {
      return NextResponse.json({ error: "Missing reviewId or tone" }, { status: 400 });
    }

    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    try {
      const aiResponse = await callGemini(review.text, tone, requestId, previousResponse);
      return NextResponse.json(aiResponse);
    } catch (error) {
      console.error("Gemini call failed, falling back to template:", error);
      await delay(500);
      return NextResponse.json(fallbackResponse(review.text, review.sentiment, tone));
    }
  } catch (error) {
    console.error("Unexpected error while generating response:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
