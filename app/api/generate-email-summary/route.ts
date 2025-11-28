import { NextResponse } from "next/server";
import { customerEmails } from "@/app/lib/emails";
import { SummaryResponse, ProductModel } from "@/app/lib/types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

async function callGeminiForEmailSummary(allEmailText: string, productContext: string): Promise<SummaryResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const prompt = `
You are an expert customer experience analyst. Summarize the following customer support emails for DanTV ${productContext}.

Emails:
"""
${allEmailText}
"""

Strictly return ONLY a valid, raw JSON object (no markdown, no surrounding backticks, no comments) in this exact shape:
{
  "summary": "<A concise executive summary of the emails>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}
`.trim();

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
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

  try {
    const cleanedJSON = mergedJSON.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(cleanedJSON);

    if (!parsed.summary || !parsed.strengths || !parsed.weaknesses || !parsed.recommendations) {
      throw new Error("Missing required fields in Gemini JSON");
    }

    return parsed as SummaryResponse;
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", mergedJSON);
    throw new Error("Invalid JSON from Gemini");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const productModel = body.productModel as ProductModel | undefined;

    const filteredEmails = productModel
      ? customerEmails.filter((email) => email.productModel === productModel)
      : customerEmails;

    const allEmailText = filteredEmails
      .map(
        (email) =>
          `Subject: ${email.subject} | Priority: ${email.priority} | Sentiment: ${email.sentiment}\n${email.body}`
      )
      .join("\n\n");

    const productContext = productModel ? `- ${productModel}` : "across all product models";

    const summaryData = await callGeminiForEmailSummary(allEmailText, productContext);
    return NextResponse.json(summaryData);
  } catch (err) {
    console.error("Email summary generation failed:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
