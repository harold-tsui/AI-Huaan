// src/shared/ai-services/mock-llm.service.ts
import { PARACategory } from '../types/knowledge-item';
import { ILLMService, LLMClassificationRequest, LLMClassificationResponse } from './llm.interface';

export class MockLLMService implements ILLMService {
  constructor() {
    console.log('MockLLMService initialized');
  }

  async classifyContentWithLLM(request: LLMClassificationRequest): Promise<LLMClassificationResponse> {
    console.log('MockLLMService: Received classification request:', request);

    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    let category: PARACategory = 'Resources'; // Default
    let confidence = 0.6 + Math.random() * 0.1; // Base confidence + some randomness
    let reasoning = 'Mock LLM classification based on simulated analysis of content.';

    const content = request.content.toLowerCase();

    if (content.includes('urgent project update') || content.includes('finalizing task')) {
      category = 'Projects';
      confidence = 0.85 + Math.random() * 0.1;
      reasoning = 'Mock LLM detected project-related keywords and urgency.';
    } else if (content.includes('long-term strategy') || content.includes('health goals')) {
      category = 'Areas';
      confidence = 0.75 + Math.random() * 0.1;
      reasoning = 'Mock LLM identified terms related to areas of responsibility.';
    } else if (content.includes('archived document') || content.includes('old reference material')) {
      category = 'Archive';
      confidence = 0.9 + Math.random() * 0.05;
      reasoning = 'Mock LLM recognized archival indicators.';
    } else if (content.includes('interesting article') || content.includes('quick note')) {
      category = 'Resources';
      // Confidence remains as default or slightly adjusted
      reasoning = 'Mock LLM classified as general resource material.';
    }

    // Simulate context influence (very basic)
    if (request.context && request.context.userPreference === 'prioritizeProjects') {
      if (category === 'Resources' && (content.includes('task') || content.includes('project'))) {
        category = 'Projects';
        confidence = Math.min(0.95, confidence + 0.15); // Boost confidence for project if preferred
        reasoning += ' User preference for projects influenced re-classification.';
      }
    }

    const response: LLMClassificationResponse = {
      category,
      confidence,
      reasoning,
      rawResponse: { simulated: true, input: request.content.substring(0, 50) + '...' }
    };

    console.log('MockLLMService: Sending response:', response);
    return response;
  }

  // Example of how other methods could be mocked:
  // async summarizeText(text: string): Promise<string> {
  //   await new Promise(resolve => setTimeout(resolve, 200));
  //   return `Mock summary of: ${text.substring(0, 30)}...`;
  // }

  // async extractKeywords(text: string): Promise<string[]> {
  //   await new Promise(resolve => setTimeout(resolve, 150));
  //   return ['mockKeyword1', 'mockKeyword2', text.split(' ')[0] || 'firstWord'];
  // }
}