import { describe, it, expect } from 'vitest';
import { PolicyEngine } from '@/lib/policy/engine';

describe('Policy Engine Hard Boundaries', () => {
  const testPolicy = {
    maxDiscountPercent: 20.0,
    maxCampaignBudget: 50000.0,
    maxSingleTransaction: 25000.0,
    approvalThresholdDiscount: 15.0,
    approvalThresholdCampaign: 15000.0,
  };

  describe('Discount Cap Matrix', () => {
    it('allows 0% discount without approval', () => {
      const res = PolicyEngine.evaluateDiscount(0, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(false);
    });

    it('allows 15% discount (exact auto-approval boundary)', () => {
      const res = PolicyEngine.evaluateDiscount(15, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(false);
    });

    it('allows 15.1% discount but requires human approval', () => {
      const res = PolicyEngine.evaluateDiscount(15.1, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(true);
    });

    it('allows 20% discount (exact merchant cap boundary) with approval', () => {
      const res = PolicyEngine.evaluateDiscount(20, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(true);
    });

    it('strictly blocks 20.01% discount', () => {
      const res = PolicyEngine.evaluateDiscount(20.01, testPolicy);
      expect(res.allowed).toBe(false);
      expect(res.ruleViolated).toBe('RULE_MAX_DISCOUNT_EXCEEDED');
    });

    it('strictly blocks 50% discount attempt', () => {
      const res = PolicyEngine.evaluateDiscount(50, testPolicy);
      expect(res.allowed).toBe(false);
      expect(res.ruleViolated).toBe('RULE_MAX_DISCOUNT_EXCEEDED');
    });

    it('blocks negative discount values', () => {
      const res = PolicyEngine.evaluateDiscount(-5, testPolicy);
      expect(res.allowed).toBe(false);
      expect(res.ruleViolated).toBe('RULE_INVALID_DISCOUNT_NEGATIVE');
    });
  });

  describe('Campaign Budget Matrix', () => {
    it('auto-approves campaign budget <= ₹15,000', () => {
      const res = PolicyEngine.evaluateCampaignBudget(15000, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(false);
    });

    it('requires human approval for ₹25,000 campaign', () => {
      const res = PolicyEngine.evaluateCampaignBudget(25000, testPolicy);
      expect(res.allowed).toBe(true);
      expect(res.requiresApproval).toBe(true);
    });

    it('strictly blocks ₹50,001 campaign exceeding ₹50,000 cap', () => {
      const res = PolicyEngine.evaluateCampaignBudget(50001, testPolicy);
      expect(res.allowed).toBe(false);
      expect(res.ruleViolated).toBe('RULE_MAX_CAMPAIGN_BUDGET_EXCEEDED');
    });
  });

  describe('Single Transaction Velocity', () => {
    it('permits ₹24,999 transaction', () => {
      const res = PolicyEngine.evaluateSingleTransaction(24999, testPolicy);
      expect(res.allowed).toBe(true);
    });

    it('blocks ₹30,000 transaction exceeding single transaction cap', () => {
      const res = PolicyEngine.evaluateSingleTransaction(30000, testPolicy);
      expect(res.allowed).toBe(false);
      expect(res.ruleViolated).toBe('RULE_SINGLE_TRANSACTION_LIMIT_EXCEEDED');
    });
  });
});
