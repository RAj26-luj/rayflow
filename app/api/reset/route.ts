import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';
import { seedDatabase } from '@/prisma/seed';

export async function POST(req: Request) {
  try {
    // 1. Safety Guard: Only permitted when DEMO_MODE is true
    if (process.env.DEMO_MODE === 'false') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Database reset is disabled in production mode (DEMO_MODE=false).',
          },
        },
        { status: 403 }
      );
    }

    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    // Re-seed demo database cleanly
    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Demo dataset successfully reset to initial pristine state.',
      merchantId: auth.merchantId,
    });
  } catch (err: any) {
    console.error('POST /api/reset error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
