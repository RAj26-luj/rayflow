import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuthenticatedMerchant();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get orders for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const paidOrders = await prisma.order.findMany({
      where: {
        merchantId: auth.merchantId,
        status: 'PAID',
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        totalAmount: true,
        isBundle: true,
        createdAt: true,
      },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = i === 0 ? `${dayNames[d.getDay()]} (Today)` : dayNames[d.getDay()];
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = paidOrders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt <= dayEnd
      );

      const baseline = dayOrders
        .filter((o) => !o.isBundle)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const aiBoost = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      chartData.push({
        day: dayLabel,
        baseline,
        aiBoost,
      });
    }

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (err: any) {
    console.error('GET /api/analytics/revenue error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
