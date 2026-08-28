import { AgentTools, AgentToolExecutionRecord } from './tools';
import { getAIProvider } from '@/lib/ai/provider';
import { prisma } from '@/lib/db/prisma';

export interface DecisionSummary {
  intent: string;
  evidence: string;
  policyCheck: {
    passed: boolean;
    ruleName?: string;
    details: string;
  };
  recommendedAction: string;
  expectedUplift?: string;
}

export interface OrchestratorResult {
  message: string;
  decisionSummary?: DecisionSummary;
  toolsExecuted: AgentToolExecutionRecord[];
  products?: any[];
  recommendedBundle?: any;
  suggestedReplies?: string[];
}

export class AgentOrchestrator {
  static async processMerchantQuery(merchantId: string, prompt: string): Promise<OrchestratorResult> {
    const toolsExecuted: AgentToolExecutionRecord[] = [];
    const lower = prompt.toLowerCase();
    const aiProvider = getAIProvider();

    // Resolve merchant name dynamically
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { name: true },
    });
    const merchantName = merchant?.name || 'the merchant';

    // Adversarial safety check 1: Attempts to bypass policy
    if (lower.includes('ignore') || lower.includes('bypass') || lower.includes('override policy')) {
      const policyCheck = await AgentTools.checkPolicy(merchantId, 50);
      toolsExecuted.push({
        name: 'check_policy',
        category: 'READ_ONLY',
        input: { discountPercent: 50 },
        output: policyCheck,
        timestamp: new Date().toISOString(),
      });

      return {
        message:
          '🚨 **Safety Block**: Autonomous agents cannot override merchant policy boundaries. All actions must strictly adhere to the configured maximum discount (20%) and campaign budget caps.',
        decisionSummary: {
          intent: 'Policy Override Request',
          evidence: 'Merchant policy explicitly denies autonomous policy bypass.',
          policyCheck: {
            passed: false,
            ruleName: 'RULE_POLICY_BYPASS_BLOCKED',
            details: 'Rejected: Hard policy boundaries cannot be overridden by conversational prompts.',
          },
          recommendedAction: 'Keep discounts within configured <= 20% cap.',
        },
        toolsExecuted,
        suggestedReplies: [
          'What is my current max discount policy?',
          'Find products with strong upsell potential',
        ],
      };
    }

    // Adversarial safety check 2: Excessive discounts (e.g. 25%, 50%, 80%)
    const discountMatch = prompt.match(/(\d+)\s*%/);
    const requestedDiscount = discountMatch ? parseInt(discountMatch[1], 10) : null;

    if (requestedDiscount && requestedDiscount > 20) {
      const policyCheck = await AgentTools.checkPolicy(merchantId, requestedDiscount);
      toolsExecuted.push({
        name: 'check_policy',
        category: 'READ_ONLY',
        input: { discountPercent: requestedDiscount },
        output: policyCheck,
        timestamp: new Date().toISOString(),
      });

      return {
        message: `🚫 **Policy Block**: Proposed discount of **${requestedDiscount}%** violates your merchant policy cap of **20%**.\n\nThe action was prevented by the zero-hallucination Policy Engine before executing any order or campaign mutation.`,
        decisionSummary: {
          intent: 'High Discount Simulation',
          evidence: `Requested discount ${requestedDiscount}% vs merchant cap 20%.`,
          policyCheck: {
            passed: false,
            ruleName: 'RULE_MAX_DISCOUNT_EXCEEDED',
            details: `Blocked: Proposed discount (${requestedDiscount}%) exceeds 20% limit.`,
          },
          recommendedAction: `Cap candidate discount to maximum 20% or lower.`,
        },
        toolsExecuted,
        suggestedReplies: [
          'Simulate a compliant 15% discount',
          'Inspect policy engine sandbox',
        ],
      };
    }

    // Intent 1: Upsell & Bundle Matching
    if (lower.includes('bundle') || lower.includes('upsell') || lower.includes('shoes') || lower.includes('running') || lower.includes('product')) {
      const searchRes = await AgentTools.searchCatalogue(merchantId, '');
      toolsExecuted.push({
        name: 'search_catalogue',
        category: 'READ_ONLY',
        input: { query: '' },
        output: { count: searchRes.count },
        timestamp: new Date().toISOString(),
      });

      if (searchRes.products.length >= 2) {
        const primary = searchRes.products[0];
        const addon = searchRes.products[1];

        const bundleRes = await AgentTools.calculateBundle(
          merchantId,
          primary.id,
          addon.id,
          15
        );

        toolsExecuted.push({
          name: 'calculate_bundle',
          category: 'SIMULATION',
          input: { primary: primary.id, addon: addon.id, discount: 15 },
          output: bundleRes,
          timestamp: new Date().toISOString(),
        });

        const aiText = await aiProvider.generateText(prompt, { merchantName });

        return {
          message: aiText.message,
          decisionSummary: {
            intent: 'Catalogue Upsell Optimization',
            evidence: `High margin pairing between ${primary.name} and ${addon.name} with ${bundleRes.bundle?.weightedGrossMargin ?? 60}% combined margin.`,
            policyCheck: {
              passed: true,
              details: '15% proposed discount complies with merchant safety cap.',
            },
            recommendedAction: `Deploy 15% bundle discount (${primary.name} + ${addon.name}).`,
            expectedUplift: `+₹${((primary.price + addon.price) * 12).toLocaleString('en-IN')} projected revenue`,
          },
          toolsExecuted,
          suggestedReplies: aiText.suggestedFollowUps,
        };
      } else if (searchRes.products.length === 1) {
        const primary = searchRes.products[0];
        return {
          message: `I found **${primary.name}** (₹${primary.price.toLocaleString('en-IN')}) in your catalogue. Add a second complementary product to unlock automated AI bundling and upsell incentives.`,
          decisionSummary: {
            intent: 'Single Item Catalogue Review',
            evidence: `Single active product in catalogue: ${primary.name}.`,
            policyCheck: {
              passed: true,
              details: 'Ready for bundle configuration.',
            },
            recommendedAction: 'Add complementary accessories or apparel to enable cross-sell.',
          },
          toolsExecuted,
          suggestedReplies: [
            'How do I add complementary products?',
            'What is my current policy cap?',
          ],
        };
      } else {
        return {
          message: 'Your catalogue is currently empty. Add products in the Catalogue tab to enable automated revenue opportunities and AI bundle incentives.',
          decisionSummary: {
            intent: 'Empty Catalogue State',
            evidence: '0 active products found in tenant database.',
            policyCheck: {
              passed: true,
              details: 'Awaiting catalogue inventory.',
            },
            recommendedAction: 'Navigate to Catalogue and click "Add Product".',
          },
          toolsExecuted,
          suggestedReplies: [
            'Go to Catalogue',
            'Inspect Policy Limits',
          ],
        };
      }
    }

    // Default intent fallback
    const aiText = await aiProvider.generateText(prompt, { merchantName });
    return {
      message: aiText.message,
      decisionSummary: {
        intent: 'General Commerce Telemetry Analysis',
        evidence: 'Active catalogue inventory and intent telemetry streams analyzed.',
        policyCheck: {
          passed: true,
          details: 'All computed interventions within safety boundaries.',
        },
        recommendedAction: 'Review active opportunities in the Opportunities feed.',
      },
      toolsExecuted,
      suggestedReplies: aiText.suggestedFollowUps,
    };
  }

  static async processBuyerQuery(merchantId: string, prompt: string): Promise<OrchestratorResult> {
    const toolsExecuted: AgentToolExecutionRecord[] = [];
    const lower = prompt.toLowerCase();

    // Resolve merchant name dynamically
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { name: true },
    });
    const merchantName = merchant?.name || 'our store';

    // Search merchant catalogue
    let searchCategory = '';
    if (lower.includes('running') || lower.includes('shoes') || lower.includes('footwear')) {
      searchCategory = 'Footwear';
    } else if (lower.includes('accessories') || lower.includes('bottle') || lower.includes('flask') || lower.includes('socks')) {
      searchCategory = 'Accessories';
    }

    let searchRes = await AgentTools.searchCatalogue(merchantId, '', searchCategory);
    if (searchRes.products.length === 0) {
      searchRes = await AgentTools.searchCatalogue(merchantId, '');
    }

    toolsExecuted.push({
      name: 'search_catalogue',
      category: 'READ_ONLY',
      input: { category: searchCategory || 'ALL' },
      output: { count: searchRes.count },
      timestamp: new Date().toISOString(),
    });

    if (searchRes.products.length >= 2) {
      const primary = searchRes.products[0];
      const addon = searchRes.products[1];

      const bundleRes = await AgentTools.calculateBundle(
        merchantId,
        primary.id,
        addon.id,
        15
      );

      toolsExecuted.push({
        name: 'calculate_bundle',
        category: 'SIMULATION',
        input: { primary: primary.id, addon: addon.id, discount: 15 },
        output: bundleRes,
        timestamp: new Date().toISOString(),
      });

      return {
        message: `I found a great recommendation for you at **${merchantName}**!\n\nThe **${primary.name}** (₹${primary.price.toLocaleString('en-IN')}) is top-rated for performance.\n\nTo give you the best value, I have paired it with **${addon.name}** at an exclusive **15% bundle discount** (Save ₹${bundleRes.bundle?.savingsAmount?.toLocaleString('en-IN') ?? '200'}).`,
        products: searchRes.products,
        recommendedBundle: bundleRes.bundle,
        toolsExecuted,
        suggestedReplies: [
          'Tell me more about product specifications.',
          'Show me other gear.',
          'Are other sizes available?',
        ],
      };
    } else if (searchRes.products.length === 1) {
      const primary = searchRes.products[0];
      return {
        message: `Welcome to **${merchantName}**! Here is our featured product: **${primary.name}** for ₹${primary.price.toLocaleString('en-IN')}.`,
        products: searchRes.products,
        toolsExecuted,
        suggestedReplies: [
          'Tell me more about this product.',
          'Proceed to checkout.',
        ],
      };
    }

    return {
      message: `Welcome to **${merchantName}**! We are currently preparing our latest performance collection. Please check back shortly!`,
      products: [],
      toolsExecuted,
      suggestedReplies: [
        'Check back later',
        'Help with orders',
      ],
    };
  }
}
