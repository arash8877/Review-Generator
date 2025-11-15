import { NextRequest, NextResponse } from "next/server";
import { reviews } from "@/app/lib/reviews";
import { Tone, Response } from "@/app/lib/types";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function generateResponse(reviewText: string, sentiment: string, tone: Tone): Response {
  const isNegative = sentiment === "negative";
  const isPositive = sentiment === "positive";
  const isNeutral = sentiment === "neutral";

  let responseText = "";
  const keyConcerns: string[] = [];

  // Extract key concerns from negative reviews
  if (isNegative) {
    if (reviewText.toLowerCase().includes("cracked") || reviewText.toLowerCase().includes("damage")) {
      keyConcerns.push("Product damage");
    }
    if (reviewText.toLowerCase().includes("customer service") || reviewText.toLowerCase().includes("support")) {
      keyConcerns.push("Customer service");
    }
    if (reviewText.toLowerCase().includes("remote")) {
      keyConcerns.push("Remote control issue");
    }
    if (reviewText.toLowerCase().includes("crash") || reviewText.toLowerCase().includes("freeze")) {
      keyConcerns.push("Software stability");
    }
    if (reviewText.toLowerCase().includes("wifi") || reviewText.toLowerCase().includes("connection")) {
      keyConcerns.push("Connectivity issues");
    }
    if (reviewText.toLowerCase().includes("pixel") || reviewText.toLowerCase().includes("screen")) {
      keyConcerns.push("Display quality");
    }
    if (reviewText.toLowerCase().includes("warranty")) {
      keyConcerns.push("Warranty coverage");
    }
    if (reviewText.toLowerCase().includes("overheat")) {
      keyConcerns.push("Safety concerns");
    }
  }

  // Generate response based on tone
  switch (tone) {
    case "Friendly":
      if (isPositive) {
        responseText = `Thank you so much for your wonderful feedback! We're thrilled to hear that you're enjoying your TV. It's great to know that the picture quality and sound are meeting your expectations. We really appreciate you taking the time to share your experience, and we're so glad you're happy with your purchase!`;
      } else if (isNegative) {
        responseText = `Hi there! We're really sorry to hear about your experience, and we want to make this right. We take all feedback seriously and would love to help resolve this issue. Could you please reach out to our support team so we can assist you? We're here to help and want to ensure you have a positive experience with our product.`;
      } else {
        responseText = `Thanks for sharing your thoughts! We appreciate your honest feedback and are always looking for ways to improve. If you have any specific suggestions or if there's anything we can help with, please don't hesitate to reach out. We value your input!`;
      }
      break;

    case "Formal":
      if (isPositive) {
        responseText = `Dear Valued Customer,

Thank you for your positive review. We are pleased to learn that our product has met your expectations regarding picture quality, sound, and overall performance. Your feedback is valuable to us and helps us maintain our commitment to excellence.

We appreciate your business and look forward to continuing to serve you.

Best regards,
Customer Service Team`;
      } else if (isNegative) {
        responseText = `Dear Customer,

We sincerely apologize for the inconvenience you have experienced. We take all customer concerns seriously and are committed to resolving this matter promptly.

We would appreciate the opportunity to address your concerns directly. Please contact our customer service department at your earliest convenience so that we may investigate and provide an appropriate resolution.

Thank you for bringing this to our attention.

Sincerely,
Customer Service Team`;
      } else {
        responseText = `Dear Customer,

Thank you for taking the time to provide your feedback. We appreciate your honest assessment and value your input as we continuously work to improve our products and services.

Should you have any additional comments or require assistance, please do not hesitate to contact us.

Best regards,
Customer Service Team`;
      }
      break;

    case "Apologetic":
      if (isPositive) {
        responseText = `Thank you so much for your kind words! We're truly grateful for your positive feedback and are delighted that you're happy with your purchase. We work hard to ensure customer satisfaction, and it means a lot to us when customers like you share their positive experiences. Thank you for choosing our product!`;
      } else if (isNegative) {
        responseText = `We are deeply sorry for the negative experience you've had with our product. This is not the standard we strive for, and we sincerely apologize for any frustration or inconvenience this has caused you.

We take full responsibility and want to make this right. Please allow us the opportunity to resolve this issue. Our support team is ready to assist you immediately, and we will do everything in our power to ensure your satisfaction.

Again, we sincerely apologize and hope to have the chance to restore your confidence in our brand.`;
      } else {
        responseText = `Thank you for your feedback. We apologize that your experience wasn't exceptional, and we appreciate you sharing your honest thoughts. We're always working to improve, and your input helps us identify areas where we can do better. If there's anything specific we can address or improve, please let us know. We're here to help.`;
      }
      break;

    case "Neutral/Professional":
      if (isPositive) {
        responseText = `Thank you for your positive feedback. We're pleased to hear that you're satisfied with your purchase. Your comments regarding picture quality and performance are noted and appreciated. We value your business and look forward to serving you in the future.`;
      } else if (isNegative) {
        responseText = `We appreciate you bringing this matter to our attention. We take all customer feedback seriously and are committed to addressing your concerns.

Our support team is available to assist you with this issue. Please contact us so we can investigate and work toward a resolution. We aim to ensure all customers have a satisfactory experience with our products.`;
      } else {
        responseText = `Thank you for your feedback. We appreciate you taking the time to share your experience. Your comments help us understand how we can improve our products and services. If you have any specific concerns or suggestions, please feel free to reach out to our support team.`;
      }
      break;
  }

  return {
    text: responseText,
    keyConcerns: keyConcerns.length > 0 ? keyConcerns : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, tone } = body;

    if (!reviewId || !tone) {
      return NextResponse.json(
        { error: "Missing reviewId or tone" },
        { status: 400 }
      );
    }

    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Simulate API delay (1-2 seconds)
    await delay(1000 + Math.random() * 1000);

    const response = generateResponse(review.text, review.sentiment, tone);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

