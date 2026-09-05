export interface AIProviderResponse {
  message: string;
  suggestedFollowUps?: string[];
  raw?: any;
}

export interface AIProviderContext {
  role?: 'merchant' | 'buyer';
  merchantName?: string;
  merchantId?: string;
  products?: any[];
  bundle?: any;
  policy?: any;
  opportunities?: any[];
  customerCohorts?: any[];
  cartCount?: number;
  cartTotal?: number;
  addedProduct?: any;
  addedBundle?: any;
  toolOutputs?: Record<string, any>;
  [key: string]: any;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, context?: AIProviderContext): Promise<AIProviderResponse>;
}
