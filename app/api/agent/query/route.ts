import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedMerchant } from '@/lib/auth/session';
import { AgentOrchestrator } from '@/lib/agent/orchestrator';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const agentQuerySchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  type: z.enum(['merchant', 'buyer']).default('merchant'),
  merchantId: z.string().optional(),
  merchantSlug: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    const body = await req.json();
    const validated = agentQuerySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const { prompt, type, merchantId: queryMerchantId, merchantSlug } = validated.data;

    let targetMerchantId = auth?.merchantId;

    if (!targetMerchantId) {
      if (type === 'merchant') {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required for merchant agent operations.' } },
          { status: 401 }
        );
      }

      // Buyer query unauthenticated resolution
      if (queryMerchantId) {
        const merchant = await prisma.merchant.findUnique({ where: { id: queryMerchantId }, select: { id: true } });
        targetMerchantId = merchant?.id;
      } else if (merchantSlug) {
        const merchant = await prisma.merchant.findUnique({ where: { slug: merchantSlug }, select: { id: true } });
        targetMerchantId = merchant?.id;
      } else {
        const defaultMerchant = await prisma.merchant.findFirst({ select: { id: true } });
        targetMerchantId = defaultMerchant?.id;
      }

      if (!targetMerchantId) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'No store merchant found.' } },
          { status: 404 }
        );
      }
    }

    let result;
    if (type === 'buyer') {
      result = await AgentOrchestrator.processBuyerQuery(targetMerchantId, prompt);
    } else {
      result = await AgentOrchestrator.processMerchantQuery(targetMerchantId, prompt);
    }

    // Record Audit Log for Agent execution
    await prisma.auditLog.create({
      data: {
        merchantId: targetMerchantId,
        actorId: auth ? auth.userId : 'buyer_guest',
        actorName: auth ? auth.userName : 'Online Shopper',
        agentName: type === 'buyer' ? 'AI Buyer Agent' : 'Revenue Agent',
        actionType: 'AGENT_QUERY',
        result: result.decisionSummary?.policyCheck?.passed === false ? 'BLOCKED' : 'SUCCESS',
        policyCheck: result.decisionSummary?.policyCheck?.passed === false ? 'FAILED' : 'PASSED',
        reason: result.decisionSummary ? result.decisionSummary.intent : 'Agent query processed.',
        metadata: JSON.stringify({
          prompt,
          toolsCount: result.toolsExecuted.length,
          hasDecisionSummary: !!result.decisionSummary,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('POST /api/agent/query error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
