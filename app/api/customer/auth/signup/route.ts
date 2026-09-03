import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, merchantSlug } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Resolve store merchant (defaults to primary store if not specified)
    let merchant = null;
    if (merchantSlug) {
      merchant = await prisma.merchant.findUnique({ where: { slug: merchantSlug } });
    }
    if (!merchant) {
      merchant = await prisma.merchant.findFirst({
        where: { slug: 'aura-athletics' },
      }) || await prisma.merchant.findFirst();
    }

    if (!merchant) {
      return NextResponse.json(
        { error: 'No active merchant store found' },
        { status: 400 }
      );
    }

    // Check if customer email already exists for this merchant
    const existing = await prisma.customer.findUnique({
      where: {
        merchantId_email: {
          merchantId: merchant.id,
          email: normalizedEmail,
        },
      },
    });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let customer;
    if (existing) {
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || existing.phone,
          passwordHash,
          isDemo: false,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          merchantId: merchant.id,
          name: name.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || '+919999999999',
          passwordHash,
          isDemo: false,
          cohort: 'New Customer',
          lifetimeValue: 0.0,
          orderCount: 0,
          intentScore: 50,
          cartStatus: 'EMPTY',
        },
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        merchantId: customer.merchantId,
      },
    });
  } catch (error: any) {
    console.error('Customer signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create customer account' },
      { status: 500 }
    );
  }
}
