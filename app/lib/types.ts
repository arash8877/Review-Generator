export type Tone = "Friendly" | "Formal" | "Apologetic" | "Neutral/Professional";

export type Sentiment = "positive" | "negative" | "neutral";

export type ProductModel = "TV-Model 1" | "TV-Model 2" | "TV-Model 3" | "TV-Model 4";

export type FilterType = "all" | "answered" | "positive" | "negative" | "neutral" | "model-1" | "model-2" | "model-3" | "model-4";

export interface Review {
  id: string;
  text: string;
  rating: number;
  sentiment: Sentiment;
  customerName: string;
  productModel: ProductModel;
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
