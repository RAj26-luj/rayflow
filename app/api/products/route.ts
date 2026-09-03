import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().positive('Price must be greater than zero'),
  compareAtPrice: z.number().positive().optional(),
  category: z.string().min(2),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  conversionRate: z.number().min(0).max(100).default(3.5),
  marginPercent: z.number().min(0).max(100).default(60),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export async function GET(req: Request) {
  try {
    const auth = await getAuthenticatedMerchant();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const merchantSlug = searchParams.get('merchant') || 'aura-athletics';

    let targetMerchantId = auth?.merchantId;
    if (!targetMerchantId) {
      const merchant = await prisma.merchant.findFirst({
        where: { slug: merchantSlug },
      });
      targetMerchantId = merchant?.id || 'mch_aura_982';
    }

    const products = await prisma.product.findMany({
      where: {
        merchantId: targetMerchantId,
        ...(category && category !== 'ALL' ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { sku: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { products } });
  } catch (err: any) {
    console.error('GET /api/products error:', err);
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
    const validated = createProductSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const data = validated.data;
    const brandPrefix = auth.merchantName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'MCH';
    const sku = `${brandPrefix}-${data.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          merchantId: auth.merchantId,
          name: data.name,
          sku,
          description: data.description || `${data.name} - Performance activewear gear.`,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          category: data.category,
          inventory: data.inventory,
          conversionRate: data.conversionRate,
          marginPercent: data.marginPercent,
          image: data.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        },
      });

      await tx.auditLog.create({
        data: {
          merchantId: auth.merchantId,
          actorId: auth.userId,
          actorName: auth.userName,
          agentName: 'Catalogue Manager',
          actionType: 'PRODUCT_CREATED',
          entityType: 'PRODUCT',
          entityId: p.id,
          amount: p.price,
          result: 'SUCCESS',
          reason: `Added product "${p.name}" (SKU: ${p.sku}) to catalogue.`,
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/products error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
