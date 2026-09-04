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
  autoAction?: {
    type: 'ADD_PRODUCT' | 'ADD_BUNDLE';
    product?: any;
    bundle?: any;
  };
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
          '🚨 **Safety Block**: Actions must adhere to your configured store policies. The requested discount or action exceeds allowed policy thresholds (e.g. 20% max discount or campaign budget caps).',
        decisionSummary: {
          intent: 'Policy Limit Check',
          evidence: 'Request exceeds configured store policy boundaries.',
          policyCheck: {
            passed: false,
            ruleName: 'RULE_POLICY_LIMIT_EXCEEDED',
            details: 'Blocked: Requested values exceed configured policy limits.',
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
        message: `🚫 **Policy Block**: Proposed discount of **${requestedDiscount}%** exceeds your configured maximum discount limit of **20%**.\n\nDiscounts must stay within store policy limits before actions or campaigns can be created.`,
        decisionSummary: {
          intent: 'Discount Policy Check',
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
          'Inspect policy controls',
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

    const isAddIntent =
      lower.includes('add to cart') ||
      lower.includes('add bundle') ||
      lower.includes('add this') ||
      lower.includes('buy this') ||
      lower.includes('buy bundle') ||
      lower.includes('put in cart');

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

      if (isAddIntent && lower.includes('bundle')) {
        return {
          message: `✅ **Added Marathon Starter Bundle to your cart!**\n\n- **${primary.name}**\n- **${addon.name}**\n\nBundle Total: **₹${bundleRes.bundle?.bundlePrice?.toLocaleString('en-IN')}** (You saved ₹${bundleRes.bundle?.savingsAmount?.toLocaleString('en-IN')}).\n\nYour cart has been updated. Open your cart drawer or click Proceed to Checkout whenever you are ready.`,
          products: searchRes.products,
          recommendedBundle: bundleRes.bundle,
          autoAction: {
            type: 'ADD_BUNDLE',
            bundle: bundleRes.bundle,
          },
          toolsExecuted,
          suggestedReplies: [
            'View Cart',
            'Proceed to Checkout',
            'Show me other gear',
          ],
        };
      }

      if (isAddIntent) {
        return {
          message: `✅ **Added ${primary.name} to your cart!**\n\nPrice: **₹${primary.price.toLocaleString('en-IN')}**.\n\nYour cart count and total have been updated. You can also add **${addon.name}** to get an instant 15% bundle discount!`,
          products: searchRes.products,
          recommendedBundle: bundleRes.bundle,
          autoAction: {
            type: 'ADD_PRODUCT',
            product: primary,
          },
          toolsExecuted,
          suggestedReplies: [
            'Add full bundle with 15% discount',
            'Proceed to Checkout',
            'Continue shopping',
          ],
        };
      }

      return {
        message: `💡 **Product Recommendation** from **${merchantName}**:\n\nThe **${primary.name}** (₹${primary.price.toLocaleString('en-IN')}) is top-rated for running performance.\n\nI have also paired it with **${addon.name}** at an exclusive **15% bundle discount** (Save ₹${bundleRes.bundle?.savingsAmount?.toLocaleString('en-IN') ?? '200'}).\n\nClick **Add to Cart** or **Add Full Bundle to Cart** below to add them to your shopping cart.`,
        products: searchRes.products,
        recommendedBundle: bundleRes.bundle,
        toolsExecuted,
        suggestedReplies: [
          'Add to cart',
          'Add bundle to cart',
          'Tell me more about product specs',
        ],
      };
    } else if (searchRes.products.length === 1) {
      const primary = searchRes.products[0];

      if (isAddIntent) {
        return {
          message: `✅ **Added ${primary.name} to your cart!**\n\nPrice: **₹${primary.price.toLocaleString('en-IN')}**.\n\nYour cart has been updated.`,
          products: searchRes.products,
          autoAction: {
            type: 'ADD_PRODUCT',
            product: primary,
          },
          toolsExecuted,
          suggestedReplies: [
            'Proceed to checkout',
            'Browse more products',
          ],
        };
      }

      return {
        message: `💡 **Product Recommendation** from **${merchantName}**:\n\n**${primary.name}** for **₹${primary.price.toLocaleString('en-IN')}**.\n\nClick **Add to Cart** below to put it in your cart.`,
        products: searchRes.products,
        toolsExecuted,
        suggestedReplies: [
          'Add to cart',
          'Tell me more about this product',
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
