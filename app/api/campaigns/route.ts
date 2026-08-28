import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';
import { AgentTools } from '@/lib/agent/tools';
import { PolicyEngine } from '@/lib/policy/engine';

export const dynamic = 'force-dynamic';

const campaignSchema = z.object({
  name: z.string().min(2),
  targetCohort: z.string().min(2),
  discountPercent: z.number().min(0).max(100),
  maxBudget: z.number().positive(),
  estimatedAudience: z.number().int().positive(),
  expectedRevenue: z.number().positive(),
  aiReasoning: z.string().optional(),
  simulateOnly: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { merchantId: auth.merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    console.error('GET /api/campaigns error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const body = await req.json();
    const validated = campaignSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const data = validated.data;

    // Simulation Request
    if (data.simulateOnly) {
      const simResult = await AgentTools.simulateCampaign(auth.merchantId, {
        discountPercent: data.discountPercent,
        maxBudget: data.maxBudget,
        estimatedAudience: data.estimatedAudience,
        expectedRevenue: data.expectedRevenue,
      });

      return NextResponse.json({
        success: true,
        simulation: simResult.simulation,
        policyCheck: {
          discount: simResult.discountCheck,
          budget: simResult.budgetCheck,
        },
      });
    }

    // Launch Campaign: Enforce policy bounds
    const policy = await prisma.agentPolicy.findUnique({ where: { merchantId: auth.merchantId } });
    const budgetCheck = PolicyEngine.evaluateCampaignBudget(data.maxBudget, policy || undefined);
    const discountCheck = PolicyEngine.evaluateDiscount(data.discountPercent, policy || undefined);

    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'POLICY_BLOCK', message: budgetCheck.reason } },
        { status: 403 }
      );
    }

    if (!discountCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'POLICY_BLOCK', message: discountCheck.reason } },
        { status: 403 }
      );
    }

    const campaign = await prisma.$transaction(async (tx) => {
      const camp = await tx.campaign.create({
        data: {
          merchantId: auth.merchantId,
          name: data.name,
          targetCohort: data.targetCohort,
          discountPercent: data.discountPercent,
          maxBudget: data.maxBudget,
          estimatedAudience: data.estimatedAudience,
          expectedRevenue: data.expectedRevenue,
          status: 'ACTIVE',
          aiReasoning: data.aiReasoning || 'AI simulated growth campaign deployed under merchant budget policy.',
        },
      });

      await tx.auditLog.create({
        data: {
          merchantId: auth.merchantId,
          actorId: auth.userId,
          actorName: auth.userName,
          agentName: 'Campaign Orchestrator',
          actionType: 'CAMPAIGN_CREATED',
          entityType: 'CAMPAIGN',
          entityId: camp.id,
          amount: camp.maxBudget,
          policyCheck: 'PASSED',
          approval: budgetCheck.requiresApproval ? 'MERCHANT_APPROVED' : 'AUTO_APPROVED',
          result: 'SUCCESS',
          reason: `Deployed campaign "${camp.name}" with budget ₹${camp.maxBudget.toLocaleString('en-IN')}.`,
        },
      });

      return camp;
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/campaigns error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
