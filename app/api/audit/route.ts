import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentName = searchParams.get('agentName');
    const result = searchParams.get('result');

    const logs = await prisma.auditLog.findMany({
      where: {
        merchantId: auth.merchantId,
        ...(agentName && agentName !== 'ALL' ? { agentName } : {}),
        ...(result && result !== 'ALL' ? { result } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    console.error('GET /api/audit error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
