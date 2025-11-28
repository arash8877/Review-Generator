import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { customerEmails } from "@/app/lib/emails";
import { Tone, Response } from "@/app/lib/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildPrompt(
  email: typeof customerEmails[number],
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

  return `
You are a customer-care specialist drafting a reply to an incoming customer email about a TV product.
If you suggest contacting customer service, use this link: dantv.customerservise.dk

Tone: ${tone}
Company: DanTV
Customer Name: ${email.customerName}
Product: ${email.productModel}
Priority: ${email.priority}
Variation token: ${requestId ?? "primary"}
Variation seed: ${variationSeed ?? "none"}

${previousBlock}

Email subject: ${email.subject}
Customer email:
"""
${email.body}
"""

Strictly return ONLY a valid, raw JSON object (no markdown, no surrounding backticks, no comments) in this exact shape:
{
  "response": "<the drafted reply as plain text>",
  "keyConcerns": ["<concern 1>", "<concern 2>"]
}
`.trim();
}

async function callGemini(
  emailId: string,
  tone: Tone,
  requestId?: string,
  previousResponse?: string,
  attempt = 1
): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const email = customerEmails.find((item) => item.id === emailId);
  if (!email) throw new Error("Email not found");

  const variationSeed = randomUUID();

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt(email, tone, requestId, previousResponse, variationSeed),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API HTTP error: ${errorText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const mergedJSON = parts.map((p: any) => p.text ?? "").join("");

  if (!mergedJSON) throw new Error("Empty Gemini response");

  let parsed;
  try {
    const cleanedJSON = mergedJSON.replace(/```json\s*|```/g, "").trim();
    parsed = JSON.parse(cleanedJSON);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", mergedJSON);
    throw new Error("Invalid JSON from Gemini");
  }

  if (!parsed.response) throw new Error("Missing 'response' field in Gemini JSON");

  if (
    previousResponse &&
    parsed.response.trim().toLowerCase() === previousResponse.trim().toLowerCase() &&
    attempt < 3
  ) {
    return callGemini(emailId, tone, randomUUID(), previousResponse, attempt + 1);
  }

  return {
    text: parsed.response,
    keyConcerns: parsed.keyConcerns ?? [],
  };
}

function fallbackResponse(body: string, sentiment: string, tone: Tone): Response {
  const base = `Thanks for reaching out.`;
  const apology =
    sentiment === "negative"
      ? " We're sorry for the trouble and want to help resolve this quickly."
      : "";
  const close =
    tone === "Formal"
      ? " Kind regards, Customer Care Team."
      : " If there's anything else we can do, please let us know.";

  return {
    text: `${base}${apology} We appreciate the details you shared. ${close}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, tone, requestId, previousResponse } = body;

    if (!emailId || !tone) {
      return NextResponse.json({ error: "Missing emailId or tone" }, { status: 400 });
    }

    const email = customerEmails.find((item) => item.id === emailId);
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    try {
      const ai = await callGemini(emailId, tone, requestId, previousResponse);
      return NextResponse.json(ai);
    } catch (err) {
      console.error("Gemini failed for email, fallback:", err);
      await delay(500);
      return NextResponse.json(fallbackResponse(email.body, email.sentiment, tone));
    }
  } catch (err) {
    console.error("Unexpected server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
