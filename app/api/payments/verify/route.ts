import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay/verify';

const paymentVerifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  paymentMethod: z.string().default('upi'),
  email: z.string().email().optional(),
  contact: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = paymentVerifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod, email, contact } = validated.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    // 1. Idempotency Check: Prevent duplicate payment processing
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId },
    });

    if (existingPayment && existingPayment.status === 'CAPTURED') {
      return NextResponse.json({
        success: true,
        verified: true,
        data: {
          order,
          payment: existingPayment,
          isDuplicate: true,
        },
      });
    }

    // 2. Cryptographic Timing-Safe Signature Verification
    const sigResult = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!sigResult.verified) {
      // Record failure audit log and update order status to ATTEMPTED
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'ATTEMPTED', failureReason: 'Cryptographic signature verification failed.' },
        });

        await tx.auditLog.create({
          data: {
            merchantId: order.merchantId,
            actorId: 'razorpay_gateway',
            actorName: 'Razorpay Gateway',
            agentName: 'Payment Verifier',
            actionType: 'PAYMENT_SIGNATURE_FAILED',
            entityType: 'ORDER',
            entityId: order.id,
            amount: order.totalAmount,
            policyCheck: 'FAILED',
            result: 'BLOCKED',
            reason: 'Payment signature mismatch. Transaction was rejected to protect against tampering.',
          },
        });
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: {
            code: 'SIGNATURE_VERIFICATION_FAILED',
            message: 'Razorpay payment signature mismatch. Transaction not verified.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Atomic Database Transaction for Payment Capture & Inventory Decrement
    const result = await prisma.$transaction(async (tx) => {
      // Update Order Status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId,
          paymentMethod,
        },
        include: { items: true },
      });

      // Create Payment Record
      const payment = await tx.payment.create({
        data: {
          merchantId: order.merchantId,
          orderId: order.id,
          razorpayPaymentId,
          razorpayOrderId,
          amount: order.totalAmount,
          currency: 'INR',
          status: 'CAPTURED',
          method: paymentMethod,
          email: email || order.customerEmail,
          contact: contact || order.customerPhone,
          signature: razorpaySignature,
          signatureVerified: true,
          idempotencyKey: razorpayPaymentId,
        },
      });

      // Decrement Inventory for purchased items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: { decrement: item.quantity },
          },
        });
      }

      // Update Customer Lifetime Value and Order Count
      if (order.customerId && order.customerId !== 'cust_guest') {
        const customer = await tx.customer.findUnique({ where: { id: order.customerId } });
        if (customer) {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              orderCount: { increment: 1 },
              lifetimeValue: { increment: order.totalAmount },
              cartStatus: 'EMPTY',
              lastPurchaseDate: new Date(),
            },
          });
        }
      }

      // Record Immutable Audit Log
      await tx.auditLog.create({
        data: {
          merchantId: order.merchantId,
          actorId: 'razorpay_gateway',
          actorName: order.customerName,
          agentName: 'Payment Gateway',
          actionType: 'PAYMENT_CAPTURED',
          entityType: 'PAYMENT',
          entityId: payment.id,
          amount: order.totalAmount,
          policyCheck: 'PASSED',
          approval: 'AUTO_APPROVED',
          result: 'SUCCESS',
          reason: `Payment of ₹${order.totalAmount.toLocaleString('en-IN')} captured via ${paymentMethod.toUpperCase()} (ID: ${razorpayPaymentId}).`,
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            razorpayPaymentId,
            method: paymentMethod,
          }),
        },
      });

      return { order: updatedOrder, payment };
    });

    return NextResponse.json({
      success: true,
      verified: true,
      data: result,
    });
  } catch (err: any) {
    console.error('POST /api/payments/verify error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
