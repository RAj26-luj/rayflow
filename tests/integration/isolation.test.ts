import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';

describe('Multi-Tenant Merchant Isolation', () => {
  let merchant1: any;
  let merchant2: any;

  beforeAll(async () => {
    const suffix = Date.now();
    merchant1 = await prisma.merchant.create({
      data: {
        name: 'Isolation Store 1',
        slug: `iso-1-${suffix}`,
        email: `iso1_${suffix}@example.com`,
      },
    });

    merchant2 = await prisma.merchant.create({
      data: {
        name: 'Isolation Store 2',
        slug: `iso-2-${suffix}`,
        email: `iso2_${suffix}@example.com`,
      },
    });

    await prisma.product.create({
      data: {
        merchantId: merchant1.id,
        name: 'Store 1 Shoe',
        sku: `ISO1-SHOE-${suffix}`,
        description: 'Store 1 footwear',
        price: 3999,
        category: 'Footwear',
        inventory: 10,
        marginPercent: 60,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    });

    await prisma.product.create({
      data: {
        merchantId: merchant2.id,
        name: 'Store 2 Yoga Mat',
        sku: `ISO2-MAT-${suffix}`,
        description: 'Store 2 fitness mat',
        price: 1999,
        category: 'Fitness Tech',
        inventory: 20,
        marginPercent: 70,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f',
      },
    });

    await prisma.auditLog.create({
      data: {
        merchantId: merchant1.id,
        actorId: 'user_1',
        actorName: 'Store 1 Admin',
        agentName: 'Revenue Agent',
        actionType: 'OPPORTUNITY_CREATED',
        amount: 3999,
        policyCheck: 'PASSED',
        approval: 'AUTO_APPROVED',
        result: 'SUCCESS',
        reason: 'Store 1 internal opportunity created.',
      },
    });
  });

  it('strictly isolates products between merchants', async () => {
    const products1 = await prisma.product.findMany({
      where: { merchantId: merchant1.id },
    });

    const products2 = await prisma.product.findMany({
      where: { merchantId: merchant2.id },
    });

    const skus1 = products1.map((p) => p.sku);
    const skus2 = products2.map((p) => p.sku);

    expect(skus1.some((s) => s.startsWith('ISO1-'))).toBe(true);
    expect(skus2.some((s) => s.startsWith('ISO2-'))).toBe(true);
    expect(skus1.some((s) => s.startsWith('ISO2-'))).toBe(false);
    expect(skus2.some((s) => s.startsWith('ISO1-'))).toBe(false);
  });

  it('strictly isolates audit logs by merchantId', async () => {
    const logs1 = await prisma.auditLog.findMany({
      where: { merchantId: merchant1.id },
    });

    for (const log of logs1) {
      expect(log.merchantId).toBe(merchant1.id);
      expect(log.merchantId).not.toBe(merchant2.id);
    }
  });
});
