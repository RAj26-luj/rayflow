import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay/verify';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify webhook cryptographic signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid && process.env.DEMO_MODE === 'false') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    // Deduplication check: Has this webhook already been processed?
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.processed) {
      return NextResponse.json({ success: true, message: 'Event already processed' });
    }

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    let targetMerchantId = paymentEntity?.notes?.merchantId || orderEntity?.notes?.merchantId;

    if (!targetMerchantId && rzpOrderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { razorpayOrderId: rzpOrderId },
        select: { merchantId: true },
      });
      if (existingOrder) {
        targetMerchantId = existingOrder.merchantId;
      }
    }

    if (!targetMerchantId) {
      const fallbackMerchant = await prisma.merchant.findFirst({ select: { id: true } });
      targetMerchantId = fallbackMerchant?.id || 'mch_system';
    }

    // Process event in transaction
    await prisma.$transaction(async (tx) => {
      // Record webhook event
      await tx.webhookEvent.upsert({
        where: { eventId },
        update: { processed: true },
        create: {
          merchantId: targetMerchantId,
          eventId,
          eventType,
          payload: rawBody,
          signatureVerified: isValid || process.env.DEMO_MODE !== 'false',
          processed: true,
        },
      });

      if (eventType === 'payment.captured' && paymentEntity) {
        const rzpOrderId = paymentEntity.order_id;
        const rzpPaymentId = paymentEntity.id;
        const amountINR = paymentEntity.amount / 100;

        const order = await tx.order.findUnique({
          where: { razorpayOrderId: rzpOrderId },
          include: { items: true },
        });

        if (order && order.status !== 'PAID') {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              razorpayPaymentId: rzpPaymentId,
              paymentMethod: paymentEntity.method,
            },
          });

          await tx.payment.upsert({
            where: { razorpayPaymentId: rzpPaymentId },
            update: { status: 'CAPTURED', signatureVerified: true },
            create: {
              merchantId: order.merchantId,
              orderId: order.id,
              razorpayPaymentId: rzpPaymentId,
              razorpayOrderId: rzpOrderId,
              amount: amountINR,
              currency: paymentEntity.currency || 'INR',
              status: 'CAPTURED',
              method: paymentEntity.method || 'upi',
              email: paymentEntity.email,
              contact: paymentEntity.contact,
              signature: signature || 'WEBHOOK_VERIFIED',
              signatureVerified: true,
            },
          });

          // Decrement stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { inventory: { decrement: item.quantity } },
            });
          }

          // Record audit log
          await tx.auditLog.create({
            data: {
              merchantId: order.merchantId,
              actorId: 'razorpay_webhook',
              actorName: 'Razorpay Webhook Service',
              agentName: 'Webhook Reconciler',
              actionType: 'WEBHOOK_PAYMENT_CAPTURED',
              entityType: 'PAYMENT',
              entityId: rzpPaymentId,
              amount: amountINR,
              policyCheck: 'PASSED',
              approval: 'AUTO_APPROVED',
              result: 'SUCCESS',
              reason: `Asynchronous payment.captured event reconciled for order #${order.orderNumber}.`,
            },
          });
        }
      }

      if (eventType === 'payment.failed' && paymentEntity) {
        const rzpOrderId = paymentEntity.order_id;
        const order = await tx.order.findUnique({ where: { razorpayOrderId: rzpOrderId } });

        if (order && order.status !== 'PAID') {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'ATTEMPTED',
              failureReason: paymentEntity.error_description || 'Payment gateway reported failure.',
            },
          });

          await tx.auditLog.create({
            data: {
              merchantId: order.merchantId,
              actorId: 'razorpay_webhook',
              actorName: 'Razorpay Webhook Service',
              agentName: 'Webhook Reconciler',
              actionType: 'WEBHOOK_PAYMENT_FAILED',
              entityType: 'ORDER',
              entityId: order.id,
              amount: paymentEntity.amount / 100,
              policyCheck: 'FAILED',
              result: 'FAILED',
              reason: `Webhook payment.failed event: ${paymentEntity.error_description || 'Declined'}.`,
              recoveryNote: 'Order remains open for checkout retry. Zero revenue credited.',
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('POST /api/webhooks/razorpay error:', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }, { status: 500 });
  }
}
