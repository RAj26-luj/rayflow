import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { getAuthenticatedMerchant, getAuthenticatedCustomer } from '@/lib/auth/session';
import { razorpayService } from '@/lib/razorpay/client';
import { PolicyEngine } from '@/lib/policy/engine';

export const dynamic = 'force-dynamic';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const createOrderSchema = z.object({
  customerId: z.string().optional().default('cust_guest'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  discountAmount: z.number().min(0).default(0),
  isBundle: z.boolean().default(false),
  bundleSavings: z.number().min(0).default(0),
  customerDetails: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6),
  }),
});

export async function GET(req: Request) {
  try {
    const merchantAuth = await getAuthenticatedMerchant();
    const customerAuth = await getAuthenticatedCustomer();

    if (!merchantAuth && !customerAuth) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    if (merchantAuth) {
      const orders = await prisma.order.findMany({
        where: {
          merchantId: merchantAuth.merchantId,
          ...(status && status !== 'ALL' ? { status } : {}),
        },
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: orders });
    }

    if (customerAuth) {
      const orders = await prisma.order.findMany({
        where: {
          customerEmail: customerAuth.customerEmail,
          ...(status && status !== 'ALL' ? { status } : {}),
        },
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: orders });
    }

    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
  } catch (err: any) {
    console.error('GET /api/orders error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchantAuth = await getAuthenticatedMerchant();
    const customerAuth = await getAuthenticatedCustomer();

    const body = await req.json();
    const validated = createOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const { items, discountAmount, isBundle, bundleSavings, customerDetails, customerId } = validated.data;

    // Server-Side Price & Stock Verification from Database
    let calculatedSubtotal = 0;
    let resolvedMerchantId = merchantAuth?.merchantId;
    const validatedItemsData: { productId: string; productName: string; quantity: number; unitPrice: number; totalAmount: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: `Product ${item.productId} not found in database.` } },
          { status: 404 }
        );
      }

      // If merchant admin is calling, ensure product belongs to their merchant
      if (merchantAuth && product.merchantId !== merchantAuth.merchantId) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: `Product ${item.productId} belongs to another merchant.` } },
          { status: 403 }
        );
      }

      if (!resolvedMerchantId) {
        resolvedMerchantId = product.merchantId;
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { success: false, error: { code: 'INSUFFICIENT_STOCK', message: `Insufficient inventory for product "${product.name}". Available: ${product.inventory}` } },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;
      validatedItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalAmount: itemTotal,
      });
    }

    const targetMerchantId = resolvedMerchantId || 'mch_aura_982';

    // Validate discount bounds against Policy Engine
    const policy = await prisma.agentPolicy.findUnique({ where: { merchantId: targetMerchantId } });
    const effectiveDiscountPercent = calculatedSubtotal > 0 ? (discountAmount / calculatedSubtotal) * 100 : 0;
    const policyCheck = PolicyEngine.evaluateDiscount(effectiveDiscountPercent, policy || undefined);

    if (!policyCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'POLICY_BLOCK', message: policyCheck.reason } },
        { status: 403 }
      );
    }

    const finalTotalAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const amountPaise = Math.round(finalTotalAmount * 100);

    // Create Razorpay Order
    const rzpOrder = await razorpayService.createOrder({
      amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      notes: {
        merchantId: targetMerchantId,
        customerEmail: customerDetails.email,
        isBundle: isBundle ? 'true' : 'false',
      },
    });

    const orderNumber = `ORD-2026-${Date.now().toString().slice(-4)}`;

    // Create Order, Upsert Customer and Record Audit in database transaction
    const order = await prisma.$transaction(async (tx) => {
      // Ensure customer exists for this tenant
      const customer = await tx.customer.upsert({
        where: {
          merchantId_email: {
            merchantId: targetMerchantId,
            email: customerDetails.email.toLowerCase().trim(),
          },
        },
        update: {
          name: customerDetails.name,
          phone: customerDetails.phone,
          orderCount: { increment: 1 },
          lastPurchaseDate: new Date(),
        },
        create: {
          merchantId: targetMerchantId,
          name: customerDetails.name,
          email: customerDetails.email.toLowerCase().trim(),
          phone: customerDetails.phone,
          cohort: 'Storefront Buyers',
          intentScore: 92,
          cartStatus: 'ACTIVE',
          orderCount: 1,
          lifetimeValue: 0,
        },
      });

      const ord = await tx.order.create({
        data: {
          merchantId: targetMerchantId,
          orderNumber,
          razorpayOrderId: rzpOrder.id,
          customerId: customer.id,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email.toLowerCase().trim(),
          customerPhone: customerDetails.phone,
          subtotalAmount: calculatedSubtotal,
          discountAmount,
          totalAmount: finalTotalAmount,
          status: 'CREATED',
          isBundle,
          bundleSavings,
          items: {
            create: validatedItemsData.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.totalAmount,
            })),
          },
        },
        include: { items: true },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          merchantId: targetMerchantId,
          actorId: customerAuth?.customerId || merchantAuth?.userId || 'guest_buyer',
          actorName: customerDetails.name,
          agentName: 'Storefront Checkout Agent',
          actionType: 'ORDER_CREATED',
          entityType: 'ORDER',
          entityId: ord.id,
          amount: finalTotalAmount,
          policyCheck: policyCheck.allowed ? 'PASSED' : 'FAILED',
          approval: 'AUTO_APPROVED',
          result: 'SUCCESS',
          reason: isBundle
            ? `Order created with AI bundle savings of ₹${bundleSavings}. Total: ₹${finalTotalAmount}`
            : `Standard order created. Total: ₹${finalTotalAmount}`,
          metadata: JSON.stringify({
            orderNumber,
            razorpayOrderId: rzpOrder.id,
            itemCount: validatedItemsData.length,
          }),
        },
      });

      return ord;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          order,
          razorpayOrder: rzpOrder,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
