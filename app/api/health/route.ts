import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    // Verify DB connectivity
    await prisma.merchant.count();
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'RAYFLOW Autonomous Revenue Agent',
      version: '1.0.0',
      database: {
        status: 'connected',
        latencyMs: dbLatencyMs,
      },
      environment: {
        demoMode: process.env.DEMO_MODE !== 'false',
        aiProvider: process.env.AI_PROVIDER || 'deterministic',
        authConfigured: !!process.env.NEXTAUTH_SECRET,
        razorpayConfigured: !!process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Database check failed',
          code: err?.code || 'UNKNOWN',
          details: err?.message ? err.message.replace(/postgresql:\/\/.*@/, 'postgresql://***@').slice(0, 150) : undefined,
        },
      },
      { status: 503 }
    );
  }
}
