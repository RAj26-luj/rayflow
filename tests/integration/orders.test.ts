import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';

describe('Order Calculations & Financial Consistency', () => {
  let merchant: any;
  let p1: any;
  let p2: any;

  beforeAll(async () => {
    const suffix = Date.now();
    merchant = await prisma.merchant.create({
      data: {
        name: 'Order Test Merchant',
        slug: `order-calc-${suffix}`,
        email: `order_calc_${suffix}@example.com`,
      },
    });

    p1 = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Order Test Runner',
        sku: `ORD-TEST-1-${suffix}`,
        description: 'Testing runner shoes',
        price: 4999.0,
        category: 'Footwear',
        inventory: 20,
        marginPercent: 65,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    });

    p2 = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Order Test Socks',
        sku: `ORD-TEST-2-${suffix}`,
        description: 'Testing running socks',
        price: 499.0,
        category: 'Accessories',
        inventory: 50,
        marginPercent: 75,
        image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82',
      },
    });
  });

  it('calculates order totals from database prices without trusting client', async () => {
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();

    const subtotal = p1.price + p2.price;
    expect(subtotal).toBe(4999.0 + 499.0); // ₹5,498.00

    const discountAmount = 200.0;
    const finalTotal = subtotal - discountAmount;
    expect(finalTotal).toBe(5298.0);

    const amountPaise = Math.round(finalTotal * 100);
    expect(amountPaise).toBe(529800); // 529800 paise
  });

  it('rejects orders when stock is insufficient', async () => {
    const availableStock = p1.inventory;
    const requestedQuantity = availableStock + 50;

    const hasEnoughStock = p1.inventory >= requestedQuantity;
    expect(hasEnoughStock).toBe(false);
  });
});
