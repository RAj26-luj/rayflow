import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '@/lib/razorpay/verify';

describe('Cryptographic Signature Verification', () => {
  const secretKey = 'test_merchant_secret_key_123';
  const orderId = 'order_test_998811';
  const paymentId = 'pay_test_445566';

  // Compute authentic HMAC-SHA256
  const authenticSignature = crypto
    .createHmac('sha256', secretKey)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  it('verifies valid HMAC-SHA256 signature with timing safety', () => {
    const res = verifyRazorpaySignature(orderId, paymentId, authenticSignature, secretKey);
    expect(res.verified).toBe(true);
    expect(res.timingSafeMatch).toBe(true);
  });

  it('rejects tampered signature', () => {
    const tampered = authenticSignature.replace(/a/g, 'b');
    const res = verifyRazorpaySignature(orderId, paymentId, tampered, secretKey);
    expect(res.verified).toBe(false);
  });

  it('rejects empty or missing parameters', () => {
    const res = verifyRazorpaySignature('', paymentId, authenticSignature, secretKey);
    expect(res.verified).toBe(false);
  });

  it('verifies valid webhook payload signature', () => {
    const body = JSON.stringify({ event: 'payment.captured', entity: { id: paymentId } });
    const webhookSecret = 'whsec_test_secret_789';
    const validWebhookSig = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    const verified = verifyRazorpayWebhookSignature(body, validWebhookSig, webhookSecret);
    expect(verified).toBe(true);
  });

  it('rejects invalid webhook payload signature', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    const verified = verifyRazorpayWebhookSignature(body, 'invalid_sig', 'whsec_test_secret_789');
    expect(verified).toBe(false);
  });
});
