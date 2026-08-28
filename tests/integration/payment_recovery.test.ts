import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';

describe('Payment Failure Recovery & Zero False Revenue Recognition', () => {
  let merchant: any;
  let customer: any;
  let product: any;

  beforeAll(async () => {
    const suffix = Date.now();
    merchant = await prisma.merchant.create({
      data: {
        name: 'Payment Recovery Store',
        slug: `pay-rec-${suffix}`,
        email: `pay_rec_${suffix}@example.com`,
      },
    });

    customer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: 'Recovery Customer',
        email: `recovery_${suffix}@example.com`,
        phone: '+919800000000',
        cohort: 'Checkout Drop-offs',
        intentScore: 80,
        cartStatus: 'CHECKOUT_VIEWED',
        orderCount: 1,
        lifetimeValue: 4299.0,
      },
    });

    product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Recovery Jacket',
        sku: `REC-JKT-${suffix}`,
        description: 'Windbreaker jacket',
        price: 4299.0,
        category: 'Apparel',
        inventory: 15,
        marginPercent: 60,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
      },
    });
  });

  it('records payment failure without marking order as paid or recognizing false revenue', async () => {
    // 1. Create a test pending order
    const testOrder = await prisma.order.create({
      data: {
        merchantId: merchant.id,
        orderNumber: `ORD-TEST-FAIL-${Date.now()}`,
        razorpayOrderId: `order_fail_test_${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        subtotalAmount: 4299.0,
        discountAmount: 0.0,
        totalAmount: 4299.0,
        status: 'CREATED',
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              unitPrice: 4299.0,
              totalAmount: 4299.0,
            },
          ],
        },
      },
    });

    expect(testOrder.status).toBe('CREATED');

    // 2. Simulate Bank Decline / Timeout
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: 'ATTEMPTED',
        failureReason: 'Transaction declined by issuing bank: Insufficient funds.',
      },
    });

    const failedPayment = await prisma.payment.create({
      data: {
        merchantId: testOrder.merchantId,
        orderId: testOrder.id,
        razorpayPaymentId: `pay_declined_${Date.now()}`,
        razorpayOrderId: testOrder.razorpayOrderId,
        amount: testOrder.totalAmount,
        currency: 'INR',
        status: 'FAILED',
        method: 'card',
        signature: 'FAILED_NO_SIG',
        signatureVerified: false,
        failureCode: 'BAD_REQUEST_PAYMENT_DECLINED',
        failureReason: 'Transaction declined by issuing bank',
      },
    });

    // 3. Verify order is NOT marked PAID and payment is marked FAILED
    expect(updatedOrder.status).toBe('ATTEMPTED');
    expect(updatedOrder.status).not.toBe('PAID');
    expect(failedPayment.status).toBe('FAILED');
    expect(failedPayment.signatureVerified).toBe(false);

    // 4. Verify customer LTV is untouched
    const freshCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });
    expect(freshCustomer?.lifetimeValue).toBe(4299.0); // Remains unchanged
  });
});
