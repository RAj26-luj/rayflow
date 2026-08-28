import { AgentPolicy } from '@prisma/client';

export interface PolicyEvaluationResult {
  allowed: boolean;
  requiresApproval: boolean;
  ruleViolated?: string;
  reason: string;
  maxPermitted?: number;
  requested?: number;
}

export const DEFAULT_POLICY_LIMITS = {
  maxDiscountPercent: 20.0,
  maxCampaignBudget: 50000.0,
  maxSingleTransaction: 25000.0,
  approvalThresholdDiscount: 15.0,
  approvalThresholdCampaign: 15000.0,
};

export class PolicyEngine {
  /**
   * Evaluates proposed discount against merchant policy.
   * Boundary checks:
   *  - Discount <= 0: Pass (0% discount)
   *  - Discount <= approvalThresholdDiscount: Auto-approved
   *  - approvalThresholdDiscount < Discount <= maxDiscountPercent: Allowed but requires human approval
   *  - Discount > maxDiscountPercent: Strictly blocked
   */
  static evaluateDiscount(
    discountPercent: number,
    policy: Partial<AgentPolicy> = DEFAULT_POLICY_LIMITS
  ): PolicyEvaluationResult {
    const maxDiscount = policy.maxDiscountPercent ?? DEFAULT_POLICY_LIMITS.maxDiscountPercent;
    const approvalThreshold = policy.approvalThresholdDiscount ?? DEFAULT_POLICY_LIMITS.approvalThresholdDiscount;

    if (discountPercent < 0) {
      return {
        allowed: false,
        requiresApproval: false,
        ruleViolated: 'RULE_INVALID_DISCOUNT_NEGATIVE',
        reason: 'Discount cannot be negative.',
        maxPermitted: maxDiscount,
        requested: discountPercent,
      };
    }

    if (discountPercent > maxDiscount) {
      return {
        allowed: false,
        requiresApproval: false,
        ruleViolated: 'RULE_MAX_DISCOUNT_EXCEEDED',
        reason: `Proposed discount (${discountPercent}%) exceeds maximum permitted merchant discount cap of ${maxDiscount}%.`,
        maxPermitted: maxDiscount,
        requested: discountPercent,
      };
    }

    if (discountPercent > approvalThreshold) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: `Proposed discount (${discountPercent}%) is within the ${maxDiscount}% cap, but exceeds the automatic approval threshold of ${approvalThreshold}%. Merchant review is required.`,
        maxPermitted: maxDiscount,
        requested: discountPercent,
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      reason: `Proposed discount (${discountPercent}%) is within bounds and automatically approved (<= ${approvalThreshold}%).`,
      maxPermitted: maxDiscount,
      requested: discountPercent,
    };
  }

  /**
   * Evaluates proposed campaign budget against merchant limits.
   */
  static evaluateCampaignBudget(
    budgetINR: number,
    policy: Partial<AgentPolicy> = DEFAULT_POLICY_LIMITS
  ): PolicyEvaluationResult {
    const maxBudget = policy.maxCampaignBudget ?? DEFAULT_POLICY_LIMITS.maxCampaignBudget;
    const approvalThreshold = policy.approvalThresholdCampaign ?? DEFAULT_POLICY_LIMITS.approvalThresholdCampaign;

    if (budgetINR <= 0) {
      return {
        allowed: false,
        requiresApproval: false,
        ruleViolated: 'RULE_INVALID_BUDGET_NON_POSITIVE',
        reason: 'Campaign budget must be greater than zero.',
        maxPermitted: maxBudget,
        requested: budgetINR,
      };
    }

    if (budgetINR > maxBudget) {
      return {
        allowed: false,
        requiresApproval: false,
        ruleViolated: 'RULE_MAX_CAMPAIGN_BUDGET_EXCEEDED',
        reason: `Proposed campaign budget (₹${budgetINR.toLocaleString('en-IN')}) exceeds maximum permitted limit of ₹${maxBudget.toLocaleString('en-IN')}.`,
        maxPermitted: maxBudget,
        requested: budgetINR,
      };
    }

    if (budgetINR > approvalThreshold) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: `Proposed campaign budget (₹${budgetINR.toLocaleString('en-IN')}) exceeds automatic approval threshold of ₹${approvalThreshold.toLocaleString('en-IN')}. Requires merchant sign-off.`,
        maxPermitted: maxBudget,
        requested: budgetINR,
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      reason: `Proposed campaign budget (₹${budgetINR.toLocaleString('en-IN')}) is within automatic threshold (<= ₹${approvalThreshold.toLocaleString('en-IN')}).`,
      maxPermitted: maxBudget,
      requested: budgetINR,
    };
  }

  /**
   * Evaluates single order transaction velocity limits.
   */
  static evaluateSingleTransaction(
    amountINR: number,
    policy: Partial<AgentPolicy> = DEFAULT_POLICY_LIMITS
  ): PolicyEvaluationResult {
    const maxTxn = policy.maxSingleTransaction ?? DEFAULT_POLICY_LIMITS.maxSingleTransaction;

    if (amountINR > maxTxn) {
      return {
        allowed: false,
        requiresApproval: true,
        ruleViolated: 'RULE_SINGLE_TRANSACTION_LIMIT_EXCEEDED',
        reason: `Single transaction amount (₹${amountINR.toLocaleString('en-IN')}) exceeds velocity safety cap of ₹${maxTxn.toLocaleString('en-IN')}.`,
        maxPermitted: maxTxn,
        requested: amountINR,
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      reason: `Transaction amount (₹${amountINR.toLocaleString('en-IN')}) is within single transaction velocity cap.`,
      maxPermitted: maxTxn,
      requested: amountINR,
    };
  }
}
