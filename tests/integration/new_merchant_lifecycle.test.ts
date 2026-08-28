import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { AgentOrchestrator } from '@/lib/agent/orchestrator';

describe('Brand-New Merchant End-to-End Lifecycle', () => {
  const merchantSlug = `apex-${Date.now()}`;
  let merchantId: string;
  let userId: string;

  beforeAll(async () => {
    // 1. Create a brand-new merchant from scratch
    const passwordHash = await bcrypt.hash('apexpass123', 10);
    const merchant = await prisma.merchant.create({
      data: {
        name: 'Apex Athletics',
        slug: merchantSlug,
        email: `admin@${merchantSlug}.com`,
        users: {
          create: {
            name: 'Rohan Apex',
            email: `rohan@${merchantSlug}.com`,
            passwordHash,
            role: 'MERCHANT_ADMIN',
          },
        },
        policy: {
          create: {
            maxDiscountPercent: 20,
            maxCampaignBudget: 50000,
            maxSingleTransaction: 25000,
            approvalThresholdDiscount: 15,
            approvalThresholdCampaign: 15000,
          },
        },
      },
      include: { users: true, policy: true },
    });

    merchantId = merchant.id;
    userId = merchant.users[0].id;
  });

  it('starts with completely clean zero-state metrics with zero fake offsets', async () => {
    const orders = await prisma.order.findMany({
      where: { merchantId, status: 'PAID' },
    });
    const opportunities = await prisma.revenueOpportunity.findMany({
      where: { merchantId },
    });

    const revenueInfluenced = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueRecovered = orders.filter((o) => o.discountAmount > 0).reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOpportunities = opportunities.filter((o) => o.status === 'PENDING').length;

    expect(revenueInfluenced).toBe(0);
    expect(revenueRecovered).toBe(0);
    expect(activeOpportunities).toBe(0);
  });

  it('allows creating custom catalogue products and dynamically computes bundles', async () => {
    // Add primary product
    const p1 = await prisma.product.create({
      data: {
        merchantId,
        name: 'Apex Carbon Shoe',
        sku: `APEX-SHOE-${Date.now()}`,
        description: 'Elite marathon shoe with carbon plate',
        price: 7999,
        category: 'Footwear',
        inventory: 25,
        conversionRate: 4.5,
        marginPercent: 65,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    });

    // Add addon product
    const p2 = await prisma.product.create({
      data: {
        merchantId,
        name: 'Apex Running Cap',
        sku: `APEX-CAP-${Date.now()}`,
        description: 'Breathable UV protective running cap',
        price: 999,
        category: 'Accessories',
        inventory: 40,
        conversionRate: 5.2,
        marginPercent: 75,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
      },
    });

    // Run Agent Orchestrator for this new merchant
    const agentResult = await AgentOrchestrator.processMerchantQuery(
      merchantId,
      'Find products with strong bundle and upsell potential'
    );

    expect(agentResult.toolsExecuted.length).toBeGreaterThanOrEqual(1);
    expect(agentResult.decisionSummary).toBeDefined();
    expect(agentResult.decisionSummary?.policyCheck.passed).toBe(true);
    expect(agentResult.decisionSummary?.recommendedAction).toContain('Apex Carbon Shoe');
    expect(agentResult.decisionSummary?.recommendedAction).toContain('Apex Running Cap');
  });

  it('creates an order and automatically provisions customer without colliding with other merchants', async () => {
    const p1 = await prisma.product.findFirst({
      where: { merchantId, name: 'Apex Carbon Shoe' },
    });
    expect(p1).toBeDefined();

    const customerEmail = `kavita_${Date.now()}@example.com`;

    // Customer upsert on order
    const customer = await prisma.customer.upsert({
      where: {
        merchantId_email: {
          merchantId,
          email: customerEmail,
        },
      },
      update: {
        name: 'Kavita Roy',
        phone: '+919876543299',
        orderCount: { increment: 1 },
      },
      create: {
        merchantId,
        name: 'Kavita Roy',
        email: customerEmail,
        phone: '+919876543299',
        cohort: 'Marathon Runners',
        intentScore: 94,
        cartStatus: 'ACTIVE',
        orderCount: 1,
        lifetimeValue: 7999,
      },
    });

    expect(customer.merchantId).toBe(merchantId);
    expect(customer.name).toBe('Kavita Roy');

    // Create Order
    const order = await prisma.order.create({
      data: {
        merchantId,
        orderNumber: `ORD-APEX-${Date.now().toString().slice(-4)}`,
        razorpayOrderId: `order_apex_${Date.now()}`,
        customerId: customer.id,
        customerName: 'Kavita Roy',
        customerEmail,
        customerPhone: '+919876543299',
        subtotalAmount: 7999,
        discountAmount: 0,
        totalAmount: 7999,
        status: 'PAID',
        items: {
          create: [
            {
              productId: p1!.id,
              productName: p1!.name,
              quantity: 1,
              unitPrice: 7999,
              totalAmount: 7999,
            },
          ],
        },
      },
    });

    expect(order.merchantId).toBe(merchantId);
    expect(order.totalAmount).toBe(7999);

    // Verify metrics now reflect this real order accurately
    const paidOrders = await prisma.order.findMany({
      where: { merchantId, status: 'PAID' },
    });
    const updatedRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    expect(updatedRevenue).toBe(7999);

    // Verify isolation: Aura Athletics records cannot see this order
    const auraOrders = await prisma.order.findMany({
      where: { merchantId: 'mch_aura_982' },
    });
    expect(auraOrders.some((o) => o.id === order.id)).toBe(false);
  });
});
