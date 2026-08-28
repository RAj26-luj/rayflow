# RAYFLOW Security Policy & Threat Model

## 1. Threat Mitigation Matrix

| Threat Vector | Mitigation Strategy | Implemented In |
| :--- | :--- | :--- |
| **Timing Attacks on Signature Verification** | Constant-time buffer comparison (`crypto.timingSafeEqual`) | `lib/razorpay/verify.ts` |
| **Insecure Direct Object References (IDOR)** | Server-side session isolation (`getAuthenticatedMerchant`) | `lib/auth/session.ts` |
| **Adversarial LLM Prompt Injection** | Deterministic Policy Engine validation before any mutation | `lib/policy/engine.ts` |
| **Price Tampering in Client Payload** | Server calculates prices directly from database records | `app/api/orders/route.ts` |
| **Over-discounting / Revenue Leakage** | Hard 20% discount ceiling and approval thresholds | `lib/policy/engine.ts` |
| **False Revenue on Bank Declines** | Strict verification; zero revenue credited on failures | `app/api/payments/fail/route.ts` |
| **Duplicate Webhook Replay Attacks** | Deduplication ledger keyed on `WebhookEvent.eventId` | `app/api/webhooks/razorpay/route.ts` |

---

## 2. Password & Credential Security
- Password hashing: **bcrypt** with standard 10 salt rounds (`bcryptjs`).
- Session strategy: **JWT** with 30-day expiry signed with `NEXTAUTH_SECRET`.
- Sensitive data redaction: Audit logs and diagnostic traces automatically scrub passwords, API secrets, and raw card details before persisting to the database.

---

## 3. Reporting Security Issues
For security disclosures, please open a private GitHub security advisory.
