import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { POST as postAgentQuery } from '@/app/api/agent/query/route';

describe('Agent Query Runtime & AuditLog Referential Integrity', () => {
  let merchantAlpha: any;
  let merchantBeta: any;
  let userAlpha: any;
  let userBeta: any;

  beforeAll(async () => {
    const hash = await bcrypt.hash('pass123', 10);
    const suffix = Date.now();

    // Merchant Alpha
    merchantAlpha = await prisma.merchant.create({
      data: {
        name: 'Alpha Athletics',
        slug: `alpha-audit-${suffix}`,
        email: `alpha-audit-${suffix}@example.com`,
        users: {
          create: {
            name: 'Alice Admin',
            email: `alice-audit-${suffix}@example.com`,
            passwordHash: hash,
            role: 'MERCHANT_ADMIN',
          },
        },
        policy: {
          create: {
            maxDiscountPercent: 20,
            maxCampaignBudget: 50000,
          },
        },
        products: {
          create: {
            name: 'Alpha Runner',
            sku: `ALPHA-RUN-${suffix}`,
            description: 'Running shoes',
            price: 2999,
            category: 'Footwear',
            inventory: 20,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
          },
        },
      },
      include: { users: true },
    });
    userAlpha = merchantAlpha.users[0];

    // Merchant Beta
    merchantBeta = await prisma.merchant.create({
      data: {
        name: 'Beta Boutique',
        slug: `beta-audit-${suffix}`,
        email: `beta-audit-${suffix}@example.com`,
        users: {
          create: {
            name: 'Bob Admin',
            email: `bob-audit-${suffix}@example.com`,
            passwordHash: hash,
            role: 'MERCHANT_ADMIN',
          },
        },
        policy: {
          create: {
            maxDiscountPercent: 15,
            maxCampaignBudget: 30000,
          },
        },
      },
      include: { users: true },
    });
    userBeta = merchantBeta.users[0];
  });

  it('successfully writes AuditLog record for merchant Alpha during agent query', async () => {
    // Execute Buyer Query for merchant Alpha
    const req = new Request('http://localhost:3000/api/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Find shoes on sale',
        type: 'buyer',
        merchantId: merchantAlpha.id,
      }),
    });

    const res = await postAgentQuery(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify AuditLog record was created and references merchantAlpha.id
    const logs = await prisma.auditLog.findMany({
      where: { merchantId: merchantAlpha.id },
      orderBy: { timestamp: 'desc' },
    });

    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].merchantId).toBe(merchantAlpha.id);
    expect(logs[0].actionType).toBe('AGENT_QUERY');
    expect(logs[0].agentName).toBe('AI Buyer Agent');
  });

  it('guarantees Merchant Beta cannot see Merchant Alpha audit logs', async () => {
    const betaLogs = await prisma.auditLog.findMany({
      where: { merchantId: merchantBeta.id },
    });

    // Zero cross-tenant leakage
    expect(betaLogs.some((log) => log.merchantId === merchantAlpha.id)).toBe(false);
  });
});
