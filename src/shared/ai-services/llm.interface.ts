// src/shared/ai-services/llm.interface.ts
import { PARACategory } from '../types/knowledge-item';

export interface LLMClassificationRequest {
  content: string;
  context?: any; // Optional context like user preferences, existing tags, etc.
  // Potentially add other parameters like desired output format, specific model instructions
}

export interface LLMClassificationResponse {
  category: PARACategory;
  confidence: number;
  reasoning?: string; // Explanation from the LLM
  rawResponse?: any; // Optional: to store the full LLM API response for debugging
}

export interface ILLMService {
  /**
   * Uses a Large Language Model to classify content into a PARA category.
   * @param request - The request object containing content and context.
   * @returns A Promise resolving to an LLMClassificationResponse.
   * @throws Error if the LLM service call fails or returns an unexpected format.
   */
  classifyContentWithLLM(request: LLMClassificationRequest): Promise<LLMClassificationResponse>;

  // Potentially other LLM-related methods could be added here, e.g.:
  // summarizeText(text: string): Promise<string>;
  // extractKeywords(text: string): Promise<string[]>;
  // generateText(prompt: string): Promise<string>;
}