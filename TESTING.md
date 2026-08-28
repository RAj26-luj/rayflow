# RAYFLOW Testing Guide

RAYFLOW contains automated test coverage across unit, integration, and end-to-end testing layers.

## 1. Running Unit & Integration Tests (Vitest)

```bash
# Run all unit and integration test suites
npm test

# Run with test coverage report
npm run test:coverage
```

### Test Suite Structure
- `tests/unit/policy.test.ts`: 12 boundary checks testing discount caps, campaign ceilings, and single transaction velocity.
- `tests/unit/signature.test.ts`: 5 cryptographic tests for timing-safe HMAC-SHA256 verification.
- `tests/unit/agent.test.ts`: 3 tests for core revenue agent reasoning, bundle recommendations, and adversarial defense.
- `tests/integration/isolation.test.ts`: 2 tests verifying cross-tenant database isolation.
- `tests/integration/orders.test.ts`: 2 tests for server-side price calculation and stock validation.
- `tests/integration/auth.test.ts`: 2 tests for bcrypt hashing and merchant credentials authentication.
- `tests/integration/payment_recovery.test.ts`: 1 test verifying payment failure handling and zero false revenue recognition.

Total: **27 Automated Tests** passing with 100% success rate.

---

## 2. Running End-to-End Tests (Playwright)

```bash
# Run Playwright E2E browser tests (Desktop & Mobile viewports)
npm run test:e2e
```

The E2E suite verifies:
1. Public Landing Page hero CTA and 5-step commerce loop.
2. Merchant Dashboard overview metrics, KPIs, and real-time Recharts.
3. Revenue Opportunities feed 1-click simulation and approval drawers.
4. AI Buyer Storefront (`/shop`) pre-payment confirmation modal and bundle checkout.
5. Compliance & Policy Audit Trail verification.
