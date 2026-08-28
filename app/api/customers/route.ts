import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Valid phone number is required'),
  cohort: z.string().default('High-Value Activewear Enthusiasts'),
  intentScore: z.number().min(0).max(100).default(75),
  lifecycleStage: z.enum(['AWARENESS', 'CONSIDERATION', 'HIGH_INTENT', 'CART_ABANDONED', 'PURCHASED']).default('HIGH_INTENT'),
  ordersCount: z.number().int().min(0).default(0),
  totalSpent: z.number().min(0).default(0),
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cohort = searchParams.get('cohort');

    const customers = await prisma.customer.findMany({
      where: {
        merchantId: auth.merchantId,
        ...(cohort && cohort !== 'ALL' ? { cohort: { contains: cohort } } : {}),
      },
      orderBy: { intentScore: 'desc' },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (err: any) {
    console.error('GET /api/customers error:', err);
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
    const validated = createCustomerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const { name, email, phone, cohort, intentScore, lifecycleStage, ordersCount, totalSpent } = validated.data;

    const customer = await prisma.customer.upsert({
      where: {
        merchantId_email: {
          merchantId: auth.merchantId,
          email: email.toLowerCase().trim(),
        },
      },
      update: {
        name,
        phone,
        cohort,
        intentScore,
        cartStatus: lifecycleStage || 'HIGH_INTENT',
        orderCount: ordersCount,
        lifetimeValue: totalSpent,
        lastPurchaseDate: new Date(),
      },
      create: {
        merchantId: auth.merchantId,
        name,
        email: email.toLowerCase().trim(),
        phone,
        cohort,
        intentScore,
        cartStatus: lifecycleStage || 'HIGH_INTENT',
        orderCount: ordersCount,
        lifetimeValue: totalSpent,
        lastPurchaseDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/customers error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
