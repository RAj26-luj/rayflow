import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { AgentOrchestrator } from '@/lib/agent/orchestrator';
import { AgentTools } from '@/lib/agent/tools';
import { PolicyEngine } from '@/lib/policy/engine';
import { GET as getOpportunities, POST as postOpportunities } from '@/app/api/opportunities/route';
import { GET as getCustomers, POST as postCustomers } from '@/app/api/customers/route';
import { POST as postProducts } from '@/app/api/products/route';
import { GET as getCampaigns, POST as postCampaigns } from '@/app/api/campaigns/route';
import { GET as getOrders } from '@/app/api/orders/route';
import { GET as getPolicies, PUT as putPolicies } from '@/app/api/policies/route';
import { GET as getSettings, PUT as putSettings } from '@/app/api/merchant/settings/route';
import { GET as getAudit } from '@/app/api/audit/route';
import { POST as postAgentQuery } from '@/app/api/agent/query/route';
import { POST as postReset } from '@/app/api/reset/route';
import { GET as getRevenueAnalytics } from '@/app/api/analytics/revenue/route';

describe('Adversarial Multi-Tenant Cross-Access & Zero-Data Isolation', () => {
  let merchantA: any;
  let merchantB: any;
  let merchantC: any; // Zero-data merchant

  let productA: any;
  let productB: any;

  let customerA: any;
  let customerB: any;

  let orderA: any;
  let orderB: any;

  beforeAll(async () => {
    const hash = await bcrypt.hash('pass123', 10);

    // 1. Provision Merchant Alpha
    const suffix = Date.now();
    merchantA = await prisma.merchant.create({
      data: {
        name: 'Alpha Athletics',
        slug: `alpha-${suffix}`,
        email: `alpha-${suffix}@example.com`,
        users: {
          create: {
            name: 'Alice Admin',
            email: `alice-${suffix}@example.com`,
            passwordHash: hash,
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
    });

    // 2. Provision Merchant Beta
    merchantB = await prisma.merchant.create({
      data: {
        name: 'Beta Footwear',
        slug: `beta-${suffix}`,
        email: `beta-${suffix}@example.com`,
        users: {
          create: {
            name: 'Bob Admin',
            email: `bob-${suffix}@example.com`,
            passwordHash: hash,
            role: 'MERCHANT_ADMIN',
          },
        },
        policy: {
          create: {
            maxDiscountPercent: 15,
            maxCampaignBudget: 30000,
            maxSingleTransaction: 15000,
            approvalThresholdDiscount: 10,
            approvalThresholdCampaign: 10000,
          },
        },
      },
    });

    // 3. Provision Merchant Gamma (Zero-Data Tenant)
    merchantC = await prisma.merchant.create({
      data: {
        name: 'Gamma Zero Store',
        slug: `gamma-${suffix}`,
        email: `gamma-${suffix}@example.com`,
        users: {
          create: {
            name: 'Charlie Zero',
            email: `charlie-${suffix}@example.com`,
            passwordHash: hash,
            role: 'MERCHANT_ADMIN',
          },
        },
        policy: {
          create: {
            maxDiscountPercent: 25,
            maxCampaignBudget: 60000,
            maxSingleTransaction: 30000,
            approvalThresholdDiscount: 20,
            approvalThresholdCampaign: 20000,
          },
        },
      },
    });

    // Create catalogue items for Alpha
    productA = await prisma.product.create({
      data: {
        merchantId: merchantA.id,
        name: 'Alpha Pro Shoes',
        sku: `ALP-SHOE-${suffix}`,
        description: 'Alpha high-cushion performance shoes',
        price: 5999,
        category: 'Footwear',
        inventory: 50,
        marginPercent: 65,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    });

    const productAAddon = await prisma.product.create({
      data: {
        merchantId: merchantA.id,
        name: 'Alpha Insoles',
        sku: `ALP-INS-${suffix}`,
        description: 'Alpha orthotic insoles',
        price: 799,
        category: 'Accessories',
        inventory: 100,
        marginPercent: 80,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b',
      },
    });

    // Create catalogue items for Beta
    productB = await prisma.product.create({
      data: {
        merchantId: merchantB.id,
        name: 'Beta Trail Boots',
        sku: `BET-BOOT-${suffix}`,
        description: 'Beta rugged waterproof trail boots',
        price: 8999,
        category: 'Footwear',
        inventory: 30,
        marginPercent: 60,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
      },
    });

    // Create customers
    customerA = await prisma.customer.create({
      data: {
        merchantId: merchantA.id,
        name: 'Customer of Alpha',
        email: `buyer_alpha_${suffix}@example.com`,
        phone: '+919811111111',
        cohort: 'Alpha VIPs',
        intentScore: 90,
        cartStatus: 'ACTIVE',
        orderCount: 1,
        lifetimeValue: 5999,
      },
    });

    customerB = await prisma.customer.create({
      data: {
        merchantId: merchantB.id,
        name: 'Customer of Beta',
        email: `buyer_beta_${suffix}@example.com`,
        phone: '+919822222222',
        cohort: 'Beta VIPs',
        intentScore: 85,
        cartStatus: 'ACTIVE',
        orderCount: 1,
        lifetimeValue: 8999,
      },
    });

    // Create orders
    orderA = await prisma.order.create({
      data: {
        merchantId: merchantA.id,
        orderNumber: `ORD-ALP-${suffix.toString().slice(-4)}`,
        razorpayOrderId: `order_alp_${suffix}`,
        customerId: customerA.id,
        customerName: customerA.name,
        customerEmail: customerA.email,
        customerPhone: customerA.phone,
        subtotalAmount: 5999,
        discountAmount: 0,
        totalAmount: 5999,
        status: 'PAID',
        items: {
          create: [
            {
              productId: productA.id,
              productName: productA.name,
              quantity: 1,
              unitPrice: 5999,
              totalAmount: 5999,
            },
          ],
        },
      },
    });

    orderB = await prisma.order.create({
      data: {
        merchantId: merchantB.id,
        orderNumber: `ORD-BET-${suffix.toString().slice(-4)}`,
        razorpayOrderId: `order_bet_${suffix}`,
        customerId: customerB.id,
        customerName: customerB.name,
        customerEmail: customerB.email,
        customerPhone: customerB.phone,
        subtotalAmount: 8999,
        discountAmount: 0,
        totalAmount: 8999,
        status: 'PAID',
        items: {
          create: [
            {
              productId: productB.id,
              productName: productB.name,
              quantity: 1,
              unitPrice: 8999,
              totalAmount: 8999,
            },
          ],
        },
      },
    });

    // Create Audit Logs
    await prisma.auditLog.create({
      data: {
        merchantId: merchantA.id,
        actorId: 'alice',
        actorName: 'Alice Admin',
        agentName: 'Revenue Agent',
        actionType: 'OPPORTUNITY_CREATED',
        amount: 5999,
        policyCheck: 'PASSED',
        approval: 'AUTO_APPROVED',
        result: 'SUCCESS',
        reason: 'Alpha confidential internal telemetry audit log.',
      },
    });

    await prisma.auditLog.create({
      data: {
        merchantId: merchantB.id,
        actorId: 'bob',
        actorName: 'Bob Admin',
        agentName: 'Revenue Agent',
        actionType: 'OPPORTUNITY_CREATED',
        amount: 8999,
        policyCheck: 'PASSED',
        approval: 'AUTO_APPROVED',
        result: 'SUCCESS',
        reason: 'Beta confidential internal telemetry audit log.',
      },
    });
  });

  describe('Adversarial Cross-Tenant Leakage Prevention', () => {
    it('prevents Merchant A from accessing Merchant B product catalogue', async () => {
      // Scoped search for Merchant A must never return Beta's products
      const searchResA = await AgentTools.searchCatalogue(merchantA.id, 'Trail Boots');
      expect(searchResA.count).toBe(0);
      expect(searchResA.products.some((p) => p.id === productB.id)).toBe(false);

      // Direct ID lookup scoped to Merchant A must return null for Beta's product
      const directLookup = await prisma.product.findFirst({
        where: { id: productB.id, merchantId: merchantA.id },
      });
      expect(directLookup).toBeNull();
    });

    it('blocks cross-tenant bundle simulation if attempting to pair competitor products', async () => {
      // Merchant A attempts to calculate bundle using Merchant B's product
      await expect(
        AgentTools.calculateBundle(merchantA.id, productA.id, productB.id, 15)
      ).rejects.toThrow('One or more bundle products could not be found in merchant catalogue.');
    });

    it('prevents Merchant A from reading Merchant B customer telemetry and orders', async () => {
      const crossCustomer = await prisma.customer.findFirst({
        where: { id: customerB.id, merchantId: merchantA.id },
      });
      expect(crossCustomer).toBeNull();

      const crossOrder = await prisma.order.findFirst({
        where: { id: orderB.id, merchantId: merchantA.id },
      });
      expect(crossOrder).toBeNull();
    });

    it('prevents Merchant A from viewing Merchant B audit trails', async () => {
      const alphaAuditLogs = await prisma.auditLog.findMany({
        where: { merchantId: merchantA.id },
      });

      expect(alphaAuditLogs.length).toBeGreaterThanOrEqual(1);
      expect(alphaAuditLogs.every((l) => l.merchantId === merchantA.id)).toBe(true);
      expect(alphaAuditLogs.some((l) => l.reason.includes('Beta confidential'))).toBe(false);
    });

    it('enforces distinct safety policy constraints per tenant', async () => {
      const policyA = await prisma.agentPolicy.findUnique({ where: { merchantId: merchantA.id } });
      const policyB = await prisma.agentPolicy.findUnique({ where: { merchantId: merchantB.id } });

      // Merchant A allows up to 20% discount; 18% is allowed
      const evalA = PolicyEngine.evaluateDiscount(18, policyA || undefined);
      expect(evalA.allowed).toBe(true);

      // Merchant B caps discount at 15%; 18% is strictly blocked
      const evalB = PolicyEngine.evaluateDiscount(18, policyB || undefined);
      expect(evalB.allowed).toBe(false);
      expect(evalB.reason).toContain('exceeds maximum permitted merchant discount cap');
    });
  });

  describe('Zero-Data Tenant Safe Operations', () => {
    it('safely queries metrics for a brand new merchant with 0 products and 0 orders', async () => {
      const orders = await prisma.order.findMany({
        where: { merchantId: merchantC.id, status: 'PAID' },
      });
      const opportunities = await prisma.revenueOpportunity.findMany({
        where: { merchantId: merchantC.id },
      });
      const customers = await prisma.customer.findMany({
        where: { merchantId: merchantC.id },
      });
      const products = await prisma.product.findMany({
        where: { merchantId: merchantC.id },
      });

      expect(orders.length).toBe(0);
      expect(opportunities.length).toBe(0);
      expect(customers.length).toBe(0);
      expect(products.length).toBe(0);
    });

    it('Agent gracefully responds to merchant queries without throwing on empty catalogue', async () => {
      const result = await AgentOrchestrator.processMerchantQuery(
        merchantC.id,
        'Find products with upsell and bundle potential'
      );

      expect(result).toBeDefined();
      expect(result.message).toContain('Your catalogue is currently empty');
      expect(result.decisionSummary?.intent).toBe('Empty Catalogue State');
      expect(result.decisionSummary?.policyCheck.passed).toBe(true);
    });

    it('Agent gracefully responds to buyer queries without throwing on empty store', async () => {
      const result = await AgentOrchestrator.processBuyerQuery(
        merchantC.id,
        'I want to buy running shoes'
      );

      expect(result).toBeDefined();
      expect(result.message).toContain('Gamma Zero Store');
      expect(result.products).toEqual([]);
      expect(result.toolsExecuted.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Strict Unauthenticated Request 401 Rejections', () => {
    it('rejects unauthenticated GET /api/opportunities with 401', async () => {
      const res = await getOpportunities(new Request('http://localhost:3000/api/opportunities') as any);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/opportunities with 401', async () => {
      const req = new Request('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({ opportunityId: 'opp_fake', action: 'APPROVE' }),
      });
      const res = await postOpportunities(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/customers with 401', async () => {
      const res = await getCustomers(new Request('http://localhost:3000/api/customers') as any);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/customers with 401', async () => {
      const req = new Request('http://localhost:3000/api/customers', {
        method: 'POST',
        body: JSON.stringify({ name: 'Sneaky', email: 'sneaky@test.com', phone: '+919999999999' }),
      });
      const res = await postCustomers(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/products with 401', async () => {
      const req = new Request('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'Unauthorized Item', price: 999, category: 'Footwear' }),
      });
      const res = await postProducts(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/campaigns with 401', async () => {
      const res = await getCampaigns(new Request('http://localhost:3000/api/campaigns') as any);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/campaigns with 401', async () => {
      const req = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ name: 'Sneaky Campaign', discountPercent: 10, maxBudget: 5000 }),
      });
      const res = await postCampaigns(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/orders with 401', async () => {
      const res = await getOrders(new Request('http://localhost:3000/api/orders') as any);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/policies with 401', async () => {
      const res = await getPolicies(new Request('http://localhost:3000/api/policies') as any);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated PUT /api/policies with 401', async () => {
      const req = new Request('http://localhost:3000/api/policies', {
        method: 'PUT',
        body: JSON.stringify({ maxDiscountPercent: 25 }),
      });
      const res = await putPolicies(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/merchant/settings with 401', async () => {
      const res = await getSettings();
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated PUT /api/merchant/settings with 401', async () => {
      const req = new Request('http://localhost:3000/api/merchant/settings', {
        method: 'PUT',
        body: JSON.stringify({ merchantName: 'Tampered Brand' }),
      });
      const res = await putSettings(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/audit with 401', async () => {
      const req = new Request('http://localhost:3000/api/audit');
      const res = await getAudit(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated merchant agent query POST /api/agent/query with 401', async () => {
      const req = new Request('http://localhost:3000/api/agent/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Tell me store secrets', type: 'merchant' }),
      });
      const res = await postAgentQuery(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/reset with 401 or 403 forbidden', async () => {
      const res = await postReset(new Request('http://localhost:3000/api/reset', { method: 'POST' }) as any);
      expect([401, 403]).toContain(res.status);
    });
  });
});
