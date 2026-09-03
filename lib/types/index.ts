// ==============================================================================
// RAYFLOW - TypeScript Core Type Definitions
// ==============================================================================

export type OpportunityType =
  | 'UPSELL'
  | 'ABANDONED_CHECKOUT'
  | 'CROSS_SELL'
  | 'LOW_CONVERSION_RECOVERY'
  | 'PRICE_OPTIMIZATION';

export type OpportunityStatus = 'PENDING' | 'SIMULATED' | 'APPROVED' | 'EXECUTED' | 'REJECTED';

export type PolicyCheckStatus = 'PASSED' | 'REQUIRES_APPROVAL' | 'BLOCKED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number; // in INR
  compareAtPrice?: number;
  category: 'Footwear' | 'Apparel' | 'Accessories' | 'Fitness Tech' | 'Hydration';
  inventory: number;
  conversionRate: number; // e.g. 3.4 for 3.4%
  marginPercent: number; // e.g. 62%
  image: string;
  complementaryProductIds: string[];
  tags: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifetimeValue: number; // in INR
  orderCount: number;
  lastPurchaseDate: string;
  viewedProductIds: string[];
  cartItems: { productId: string; quantity: number }[];
  cartStatus: 'ACTIVE' | 'ABANDONED' | 'EMPTY' | 'CHECKOUT_VIEWED';
  intentScore: number; // 0 to 100
  predictedNextProductId?: string;
  cohort: string;
  notes?: string;
}

export interface RevenueOpportunity {
  id: string;
  type: OpportunityType;
  title: string;
  subtitle: string;
  description: string;
  expectedRevenue: number;
  confidence: number; // 0 to 100
  affectedCustomersCount: number;
  affectedCustomerCohort: string;
  sourceProductId?: string;
  targetProductId?: string;
  reasoning: string;
  recommendedAction: string;
  actionPayload: {
    bundleProductIds?: string[];
    discountPercent?: number;
    bundlePrice?: number;
    originalPrice?: number;
    savingsAmount?: number;
    campaignAudience?: string;
    maxBudget?: number;
  };
  riskLevel: RiskLevel;
  status: OpportunityStatus;
  policyStatus: PolicyCheckStatus;
  policyNotes: string;
  createdAt: string;
  executedAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  targetCohort: string;
  offerType: 'BUNDLE_DISCOUNT' | 'ACCESSORY_UPSELL' | 'ABANDONED_RECOVERY';
  discountPercent: number;
  estimatedAudience: number;
  expectedRevenue: number;
  maxBudget: number;
  spentBudget: number;
  convertedOrders: number;
  status: 'DRAFT' | 'SIMULATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  aiReasoning: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discountedPrice: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'CREATED' | 'ATTEMPTED' | 'PAID' | 'FAILED';
  isBundle: boolean;
  bundleSavings?: number;
  paymentMethod?: 'card' | 'upi' | 'netbanking' | 'wallet';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: 'CAPTURED' | 'FAILED' | 'PENDING';
  method: string;
  email?: string;
  contact?: string;
  signature?: string;
  failureReason?: string;
  errorCode?: string;
  createdAt: string;
}

export interface AgentPolicy {
  id: string;
  maxDiscountPercent: number; // e.g. 20%
  maxCampaignBudget: number; // e.g. 50000
  maxSingleTransaction: number; // e.g. 25000
  approvalThresholdDiscount: number; // e.g. 15% (discounts > 15% need approval)
  approvalThresholdCampaign: number; // e.g. 10000 (campaigns > 10k need approval)
  allowDirectDiscounts: boolean;
  allowAutoBundle: boolean;
  allowAutoCampaign: boolean;
  allowRefunds: boolean; // restricted by default
  allowDirectPriceChange: boolean; // restricted by default
  restrictedActions: string[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  agentName: 'Revenue Agent' | 'AI Buyer Agent' | 'Policy Guard' | 'System';
  actionType: string;
  reason: string;
  customerName?: string;
  customerId?: string;
  amount?: number;
  policyCheck: 'PASSED' | 'FAILED' | 'BYPASSED';
  approval: 'MERCHANT_APPROVED' | 'AUTO_APPROVED' | 'CUSTOMER_APPROVED' | 'REJECTED' | 'N/A';
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'PENDING';
  recoveryNote?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  metadata?: Record<string, any>;
}

export interface AgentToolCall {
  name: string;
  params: Record<string, any>;
  result: any;
}

export interface AgentResponse {
  message: string;
  intent: string;
  toolsExecuted: AgentToolCall[];
  decisionSummary?: {
    intent: string;
    evidence: string;
    policyCheck: {
      passed: boolean;
      details: string;
    };
    recommendedAction: string;
    expectedUplift?: string;
    actionPayload?: Record<string, any>;
  };
  suggestedPrompts?: string[];
}
