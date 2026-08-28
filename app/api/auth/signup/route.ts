import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validated.error.errors[0]?.message || 'Invalid registration details',
          },
        },
        { status: 400 }
      );
    }

    const { name, storeName, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'An account with this email address already exists.',
          },
        },
        { status: 409 }
      );
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    // Create Merchant, Admin User, and Default Policy in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: {
          name: storeName,
          slug,
          email: normalizedEmail,
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

      const user = await tx.user.create({
        data: {
          merchantId: merchant.id,
          name,
          email: normalizedEmail,
          passwordHash,
          role: 'MERCHANT_ADMIN',
        },
      });

      await tx.auditLog.create({
        data: {
          merchantId: merchant.id,
          actorId: user.id,
          actorName: user.name,
          agentName: 'Auth Service',
          actionType: 'SIGNUP',
          entityType: 'USER',
          entityId: user.id,
          result: 'SUCCESS',
          reason: `New merchant organization "${storeName}" registered.`,
        },
      });

      return { merchant, user };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            merchantId: result.merchant.id,
            merchantName: result.merchant.name,
            role: result.user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating your account. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
