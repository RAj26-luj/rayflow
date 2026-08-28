# RAYFLOW Architecture Documentation

## Architectural Invariant
> *"AI may recommend. Deterministic systems decide. Policies constrain. Humans approve where required. The payment gateway verifies. The database records. The audit trail remembers."*

---

## 1. Multi-Tenant Data Layer & Isolation

RAYFLOW enforces strict multi-tenant isolation across all data access patterns:

- **Identity Resolution**: Handled via NextAuth JWT sessions. Every API endpoint calls `getAuthenticatedMerchant()`, extracting the verified `merchantId`.
- **Zero Request Body Trust**: The server never reads `merchantId` from user request bodies or query parameters for authorization.
- **Foreign Key Cascades**: Every entity (`Product`, `Customer`, `Order`, `Payment`, `AuditLog`, `Campaign`, `RevenueOpportunity`) references `Merchant.id` with strict database indexing.

```
Merchant (mch_aura_982)
 ├── Users (Admin & Member)
 ├── Policy (Cap: 20% discount, ₹50k budget)
 ├── Products (7 active SKUs)
 ├── Orders & Items (Server-calculated)
 ├── Payments (HMAC-SHA256 verified)
 └── AuditLogs (Immutable append-only ledger)
```

---

## 2. Deterministic Policy Engine & State Machine

The Policy Engine (`lib/policy/engine.ts`) executes without LLM dependencies. It evaluates numeric boundaries deterministically:

| Metric | Auto-Approved | Human Review Gate | Hard Policy Block |
| :--- | :--- | :--- | :--- |
| **Bundle Discount** | $\le 15\%$ | $15.01\% - 20.0\%$ | $> 20.0\%$ (`RULE_MAX_DISCOUNT_EXCEEDED`) |
| **Campaign Budget** | $\le ₹15,000$ | $₹15,001 - ₹50,000$ | $> ₹50,000$ (`RULE_MAX_CAMPAIGN_BUDGET_EXCEEDED`) |
| **Single Txn Velocity** | $\le ₹25,000$ | — | $> ₹25,000$ (`RULE_SINGLE_TRANSACTION_LIMIT_EXCEEDED`) |

### Opportunity Lifecycle State Machine
```
[PENDING] ──(Simulate)──> [SIMULATED]
    │                          │
    └───(Approve)───> [EXECUTED] <──┘
    │
    └───(Reject)────> [REJECTED]
```

---

## 3. Financial Consistency & Monetary Precision

1. **Paise Precision**: All monetary values are maintained in standard floating-point INR in database display layers and converted to integer paise ($\times 100$) for Razorpay order generation and cryptographic payload calculations.
2. **ACID Transactions**: Order creation, payment capture, inventory decrementing, and audit logging execute inside an atomic `prisma.$transaction()` block. If any step fails, the entire transaction rolls back cleanly.
3. **Idempotent Payment Capture**: If Razorpay sends duplicate webhooks or multiple verify calls for the same `razorpayPaymentId`, RAYFLOW checks existing captured payments before modifying inventory or LTV.

---

## 4. Cryptographic Security & Razorpay Integration

- **Timing-Safe HMAC Verification**:
  ```ts
  const hmac = crypto.createHmac('sha256', secretKey).update(`${orderId}|${paymentId}`).digest('hex');
  crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  ```
- **Failure Recovery**: Bank declines and UPI timeouts update order status to `ATTEMPTED` while keeping checkout open for 1-click retry. Zero revenue is recognized in reports.
