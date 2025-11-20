export type Tone = "Friendly" | "Formal" | "Apologetic" | "Neutral/Professional";

export type Sentiment = "positive" | "negative" | "neutral";

export type FilterType = "all" | "answered" | "positive" | "negative" | "neutral";

export interface Review {
  id: string;
  text: string;
  rating: number;
  sentiment: Sentiment;
  customerName: string;
  answered?: boolean;
}

export interface ResponseRequest {
  reviewId: string;
  tone: Tone;
}

export interface Response {
  text: string;
  keyConcerns?: string[];
}


export interface SummaryResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
