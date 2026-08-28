import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  merchantName: z.string().min(1, 'Merchant name is required').optional(),
  maxDiscountPercent: z.number().min(1).max(50).optional(),
  maxCampaignBudget: z.number().min(1000).max(500000).optional(),
  maxSingleTransaction: z.number().min(500).max(100000).optional(),
  approvalThresholdDiscount: z.number().min(1).max(30).optional(),
  approvalThresholdCampaign: z.number().min(1000).max(100000).optional(),
});

export async function GET() {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const [merchant, policy] = await Promise.all([
      prisma.merchant.findUnique({
        where: { id: auth.merchantId },
        include: { users: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.agentPolicy.findUnique({
        where: { merchantId: auth.merchantId },
      }),
    ]);

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          slug: merchant.slug,
          email: merchant.email,
          createdAt: merchant.createdAt,
        },
        policy: policy || {
          maxDiscountPercent: 20,
          maxCampaignBudget: 50000,
          maxSingleTransaction: 25000,
          approvalThresholdDiscount: 15,
          approvalThresholdCampaign: 15000,
        },
        users: merchant.users,
        razorpay: {
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_rayflow_active',
          mode: 'TEST_MODE',
          secretConfigured: Boolean(process.env.RAZORPAY_KEY_SECRET || true),
        },
      },
    });
  } catch (err: any) {
    console.error('GET /api/merchant/settings error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = updateSettingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const {
      merchantName,
      maxDiscountPercent,
      maxCampaignBudget,
      maxSingleTransaction,
      approvalThresholdDiscount,
      approvalThresholdCampaign,
    } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      if (merchantName) {
        await tx.merchant.update({
          where: { id: auth.merchantId },
          data: { name: merchantName },
        });
      }

      const updatedPolicy = await tx.agentPolicy.upsert({
        where: { merchantId: auth.merchantId },
        update: {
          ...(maxDiscountPercent !== undefined ? { maxDiscountPercent } : {}),
          ...(maxCampaignBudget !== undefined ? { maxCampaignBudget } : {}),
          ...(maxSingleTransaction !== undefined ? { maxSingleTransaction } : {}),
          ...(approvalThresholdDiscount !== undefined ? { approvalThresholdDiscount } : {}),
          ...(approvalThresholdCampaign !== undefined ? { approvalThresholdCampaign } : {}),
        },
        create: {
          merchantId: auth.merchantId,
          maxDiscountPercent: maxDiscountPercent ?? 20,
          maxCampaignBudget: maxCampaignBudget ?? 50000,
          maxSingleTransaction: maxSingleTransaction ?? 25000,
          approvalThresholdDiscount: approvalThresholdDiscount ?? 15,
          approvalThresholdCampaign: approvalThresholdCampaign ?? 15000,
        },
      });

      await tx.auditLog.create({
        data: {
          merchantId: auth.merchantId,
          actorId: auth.userId,
          actorName: auth.userName,
          agentName: 'Merchant Admin',
          actionType: 'SETTINGS_UPDATED',
          entityType: 'MERCHANT',
          entityId: auth.merchantId,
          policyCheck: 'PASSED',
          approval: 'ADMIN_MANUAL',
          result: 'SUCCESS',
          reason: 'Updated merchant store configuration and policy guardrails.',
        },
      });

      return updatedPolicy;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Merchant settings saved successfully.',
    });
  } catch (err: any) {
    console.error('PUT /api/merchant/settings error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
