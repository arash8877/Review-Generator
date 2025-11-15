export type Tone = "Friendly" | "Formal" | "Apologetic" | "Neutral/Professional";

export type Sentiment = "positive" | "negative" | "neutral";

export interface Review {
  id: string;
  text: string;
  rating: number;
  sentiment: Sentiment;
}

export interface ResponseRequest {
  reviewId: string;
  tone: Tone;
}

export interface Response {
  text: string;
  keyConcerns?: string[];
}

