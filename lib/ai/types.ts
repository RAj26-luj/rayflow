export interface AIProviderResponse {
  message: string;
  suggestedFollowUps?: string[];
  raw?: any;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, context?: Record<string, any>): Promise<AIProviderResponse>;
}
