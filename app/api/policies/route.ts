import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const policyUpdateSchema = z.object({
  maxDiscountPercent: z.number().min(0).max(50, 'Max discount limit cannot exceed 50%'),
  maxCampaignBudget: z.number().min(1000).max(500000),
  maxSingleTransaction: z.number().min(1000).max(100000),
  approvalThresholdDiscount: z.number().min(0).max(50),
  approvalThresholdCampaign: z.number().min(1000).max(500000),
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    let policy = await prisma.agentPolicy.findUnique({
      where: { merchantId: auth.merchantId },
    });

    if (!policy) {
      policy = await prisma.agentPolicy.create({
        data: {
          merchantId: auth.merchantId,
          maxDiscountPercent: 20.0,
          maxCampaignBudget: 50000.0,
          maxSingleTransaction: 25000.0,
          approvalThresholdDiscount: 15.0,
          approvalThresholdCampaign: 15000.0,
        },
      });
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (err: any) {
    console.error('GET /api/policies error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const body = await req.json();
    const validated = policyUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const data = validated.data;

    const updated = await prisma.$transaction(async (tx) => {
      const policy = await tx.agentPolicy.upsert({
        where: { merchantId: auth.merchantId },
        update: data,
        create: {
          merchantId: auth.merchantId,
          ...data,
        },
      });

      await tx.auditLog.create({
        data: {
          merchantId: auth.merchantId,
          actorId: auth.userId,
          actorName: auth.userName,
          agentName: 'Policy Engine',
          actionType: 'POLICY_UPDATED',
          entityType: 'POLICY',
          entityId: policy.id,
          policyCheck: 'PASSED',
          approval: 'MERCHANT_APPROVED',
          result: 'SUCCESS',
          reason: `Merchant updated safety policy bounds (Max Discount: ${policy.maxDiscountPercent}%, Max Campaign: ₹${policy.maxCampaignBudget}).`,
        },
      });

      return policy;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('PUT /api/policies error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
