import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getAuthenticatedCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in as a customer.' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: customer.customerEmail,
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.customerId,
        name: customer.customerName,
        email: customer.customerEmail,
      },
      orders,
    });
  } catch (error: any) {
    console.error('Customer orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer orders' },
      { status: 500 }
    );
  }
}
