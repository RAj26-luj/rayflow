import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';
import { seedDatabase } from '@/prisma/seed';

export async function POST(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    
    // 1. Safety Guard: Only permitted in DEMO_MODE or for authenticated demo merchant
    const isDemoUser = auth?.userEmail === 'arjun@auraathletics.com' || auth?.userEmail === 'rohan@zenithactive.com';
    const isDemoModeEnabled = process.env.DEMO_MODE !== 'false';

    if (!isDemoModeEnabled && !isDemoUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Database reset is restricted to demo accounts and environments.',
          },
        },
        { status: 403 }
      );
    }

    // Re-seed demo database cleanly
    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Demo dataset successfully reset to initial pristine state.',
      merchantId: auth?.merchantId || 'mch_aura_982',
    });
  } catch (err: any) {
    console.error('POST /api/reset error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
