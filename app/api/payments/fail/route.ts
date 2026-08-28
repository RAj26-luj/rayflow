import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const paymentFailSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  failureReason: z.string().min(1),
  errorCode: z.string().optional().default('PAYMENT_ERROR'),
  method: z.string().optional().default('upi'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = paymentFailSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0]?.message } }, { status: 400 });
    }

    const { orderId, razorpayOrderId, failureReason, errorCode, method } = validated.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Update order status to ATTEMPTED with failure reason (Zero revenue recognized)
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'ATTEMPTED',
          failureReason,
        },
      });

      // Create Payment Failure record for diagnostics
      await tx.payment.create({
        data: {
          merchantId: order.merchantId,
          orderId: order.id,
          razorpayPaymentId: `pay_failed_${Date.now()}`,
          razorpayOrderId,
          amount: order.totalAmount,
          currency: 'INR',
          status: 'FAILED',
          method,
          signature: 'FAILED_NO_SIG',
          signatureVerified: false,
          failureCode: errorCode,
          failureReason,
        },
      });

      // Log failure in Compliance Audit Trail
      await tx.auditLog.create({
        data: {
          merchantId: order.merchantId,
          actorId: 'razorpay_gateway',
          actorName: order.customerName,
          agentName: 'Payment Gateway',
          actionType: 'PAYMENT_FAILED',
          entityType: 'ORDER',
          entityId: order.id,
          amount: order.totalAmount,
          policyCheck: 'FAILED',
          result: 'FAILED',
          reason: `Payment attempt failed: ${failureReason} (Error Code: ${errorCode}).`,
          recoveryNote: 'Order remains in open checkout state for 1-click retry. Zero revenue credited.',
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            errorCode,
            method,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      errorHandled: true,
      canRetry: true,
      message: "Payment wasn't completed. No money was marked as received.",
      details: failureReason,
      orderStatus: 'ATTEMPTED',
      revenueImpact: 0,
    });
  } catch (err: any) {
    console.error('POST /api/payments/fail error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
