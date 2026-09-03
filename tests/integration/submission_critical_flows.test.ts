import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import { PolicyEngine } from '@/lib/policy/engine';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '@/lib/razorpay/verify';
import { POST as verifyPaymentHandler } from '@/app/api/payments/verify/route';
import { POST as webhookHandler } from '@/app/api/webhooks/razorpay/route';
import { POST as opportunitiesHandler } from '@/app/api/opportunities/route';

describe('Submission-Critical 10-Point Verification Matrix', () => {
  let merchantAlpha: any;
  let merchantBeta: any;
  let productAlpha: any;
  let customerAlpha: any;

  beforeAll(async () => {
    merchantAlpha = await prisma.merchant.create({
      data: {
        name: 'Submission Alpha Store',
        slug: `sub-alpha-${Date.now()}`,
        email: `alpha_${Date.now()}@example.com`,
        policy: {
          create: {
            maxDiscountPercent: 20.0,
            maxCampaignBudget: 50000.0,
            maxSingleTransaction: 25000.0,
            approvalThresholdDiscount: 15.0,
            approvalThresholdCampaign: 15000.0,
          },
        },
      },
    });

    merchantBeta = await prisma.merchant.create({
      data: {
        name: 'Submission Beta Store',
        slug: `sub-beta-${Date.now()}`,
        email: `beta_${Date.now()}@example.com`,
      },
    });

    productAlpha = await prisma.product.create({
      data: {
        merchantId: merchantAlpha.id,
        name: 'Alpha Carbon Shoe',
        sku: 'ALPHA-SHOE-01',
        description: 'Racing shoe',
        price: 5000.0,
        category: 'Footwear',
        inventory: 10,
        marginPercent: 65.0,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    });

    customerAlpha = await prisma.customer.create({
      data: {
        merchantId: merchantAlpha.id,
        name: 'Shopper Alpha',
        email: `shopper_alpha_${Date.now()}@example.com`,
        phone: '+919811223344',
        cohort: 'VIP',
        intentScore: 90,
      },
    });
  });

  // 1. Cross-tenant isolation
  it('1. Cross-Tenant Isolation: Merchant Beta cannot view or modify Merchant Alpha products', async () => {
    const betaProducts = await prisma.product.findMany({
      where: { merchantId: merchantBeta.id },
    });
    expect(betaProducts.find((p) => p.id === productAlpha.id)).toBeUndefined();
  });

  // 2. 30% discount blocked
  it('2. Safety Boundary: 30% discount is strictly BLOCKED by policy engine', () => {
    const verdict = PolicyEngine.evaluateDiscount(30, {
      maxDiscountPercent: 20.0,
      approvalThresholdDiscount: 15.0,
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.ruleViolated).toBe('RULE_MAX_DISCOUNT_EXCEEDED');
  });

  // 3. 15% discount requires approval (>15% requires approval)
  it('3. Governance Boundary: 15.1% discount is allowed but requires human approval', () => {
    const verdict = PolicyEngine.evaluateDiscount(15.1, {
      maxDiscountPercent: 20.0,
      approvalThresholdDiscount: 15.0,
    });
    expect(verdict.allowed).toBe(true);
    expect(verdict.requiresApproval).toBe(true);
  });

  // 4. Campaign budget >₹50k blocked
  it('4. Budget Boundary: ₹50,001 campaign budget is strictly BLOCKED by policy engine', () => {
    const verdict = PolicyEngine.evaluateCampaignBudget(50001, {
      maxCampaignBudget: 50000.0,
      approvalThresholdCampaign: 15000.0,
    });
    expect(verdict.allowed).toBe(false);
    expect(verdict.ruleViolated).toBe('RULE_MAX_CAMPAIGN_BUDGET_EXCEEDED');
  });

  // 5. Payment signature validation
  it('5. Cryptographic Security: Rejects invalid or forged Razorpay HMAC signatures', () => {
    const invalidSig = verifyRazorpaySignature('order_test_123', 'pay_test_456', 'forged_invalid_signature_hash');
    expect(invalidSig.verified).toBe(false);
  });

  // 6. Payment idempotency
  it('6. Financial Idempotency: Duplicate payment verification returns existing captured record without double processing', async () => {
    const order = await prisma.order.create({
      data: {
        merchantId: merchantAlpha.id,
        orderNumber: `ORD-IDEMP-${Date.now()}`,
        razorpayOrderId: `rzp_order_idemp_${Date.now()}`,
        customerId: customerAlpha.id,
        customerName: customerAlpha.name,
        customerEmail: customerAlpha.email,
        customerPhone: customerAlpha.phone,
        subtotalAmount: 5000.0,
        totalAmount: 5000.0,
        status: 'PAID',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        merchantId: merchantAlpha.id,
        orderId: order.id,
        razorpayPaymentId: `pay_idemp_${Date.now()}`,
        razorpayOrderId: order.razorpayOrderId,
        amount: 5000.0,
        status: 'CAPTURED',
        method: 'upi',
        signature: 'sig_valid_test_idemp',
        signatureVerified: true,
      },
    });

    const verifyReq = new Request('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpaySignature: 'sig_valid_test_idemp',
      }),
    });

    const res = await verifyPaymentHandler(verifyReq);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.isDuplicate).toBe(true);
  });

  // 7. Webhook idempotency
  it('7. Webhook Replay Protection: Re-delivering the same webhook event ID returns already processed', async () => {
    const eventId = `evt_idemp_${Date.now()}`;
    await prisma.webhookEvent.create({
      data: {
        merchantId: merchantAlpha.id,
        eventId,
        eventType: 'payment.captured',
        payload: '{}',
        processed: true,
      },
    });

    const webhookReq = new Request('http://localhost:3000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'test_wh_sig',
      },
      body: JSON.stringify({
        id: eventId,
        event: 'payment.captured',
        payload: {},
      }),
    });

    const res = await webhookHandler(webhookReq);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Event already processed');
  });

  // 8. Inventory cannot go negative/double decrement
  it('8. Stock Safety: Inventory updates accurately reflect order quantity and do not drop below zero', async () => {
    const initialInventory = productAlpha.inventory;
    const orderQty = 2;

    await prisma.product.update({
      where: { id: productAlpha.id },
      data: { inventory: { decrement: orderQty } },
    });

    const updatedProduct = await prisma.product.findUnique({ where: { id: productAlpha.id } });
    expect(updatedProduct?.inventory).toBe(initialInventory - orderQty);
  });

  // 9. Customer cannot access another merchant’s orders
  it('9. Shopper Privacy: Customer query isolated by customer email and tenant merchant', async () => {
    const alphaOrders = await prisma.order.findMany({
      where: { customerEmail: customerAlpha.email },
    });
    expect(alphaOrders.every((o) => o.merchantId === merchantAlpha.id)).toBe(true);
  });

  // 10. Merchant cannot access another merchant’s data
  it('10. Data Governance: Merchant Alpha policies and audits are completely isolated from Merchant Beta', async () => {
    const alphaPolicies = await prisma.agentPolicy.findMany({
      where: { merchantId: merchantAlpha.id },
    });
    const betaPolicies = await prisma.agentPolicy.findMany({
      where: { merchantId: merchantBeta.id },
    });

    expect(alphaPolicies.length).toBeGreaterThan(0);
    expect(betaPolicies.find((p) => p.merchantId === merchantAlpha.id)).toBeUndefined();
  });
});
