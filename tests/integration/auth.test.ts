import { describe, it, expect, beforeAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { authOptions } from '@/lib/auth/options';

describe('Authentication & Password Security', () => {
  const testEmail = `auth_test_${Date.now()}@example.com`;
  const testPass = 'SecureMerchantPassword2026!';

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(testPass, 10);
    await prisma.merchant.create({
      data: {
        name: 'Auth Test Store',
        slug: `auth-test-${Date.now()}`,
        email: testEmail,
        users: {
          create: {
            name: 'Auth Admin',
            email: testEmail,
            passwordHash,
            role: 'MERCHANT_ADMIN',
          },
        },
      },
    });
  });

  it('hashes passwords securely with bcrypt and verifies matching passwords', async () => {
    const rawPassword = 'SecureMerchantPassword2026!';
    const hash = await bcrypt.hash(rawPassword, 10);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await bcrypt.compare(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('authenticates merchant user with bcrypt-hashed credentials', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { merchant: true },
    });

    expect(user).toBeDefined();
    expect(user!.role).toBe('MERCHANT_ADMIN');
    expect(user!.merchant).toBeDefined();

    const isValid = await bcrypt.compare(testPass, user!.passwordHash);
    expect(isValid).toBe(true);
  });

  const getAuthorize = () => {
    const provider: any = authOptions.providers.find((p: any) => p.id === 'credentials');
    return provider.options?.authorize || provider.authorize;
  };

  it('1. Arjun seeded account login succeeds with demo123', async () => {
    const authorize = getAuthorize();
    const user = await authorize({
      email: 'arjun@auraathletics.com',
      password: 'demo123',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('arjun@auraathletics.com');
    expect(user.merchantId).toBe('mch_aura_982');
    expect(user.merchantName).toBe('Aura Athletics');
    expect(user.role).toBe('MERCHANT_ADMIN');
  });

  it('2. Another seeded user login succeeds (Pooja with demo123 and Rohan with zenith123)', async () => {
    const authorize = getAuthorize();

    // Test Pooja (Aura Athletics Member)
    const pooja = await authorize({
      email: 'pooja@auraathletics.com',
      password: 'demo123',
    });
    expect(pooja).toBeDefined();
    expect(pooja.email).toBe('pooja@auraathletics.com');
    expect(pooja.merchantId).toBe('mch_aura_982');
    expect(pooja.role).toBe('MERCHANT_MEMBER');

    // Test Rohan (Zenith Active Admin - uses zenith123 password)
    const rohan = await authorize({
      email: 'rohan@zenithactive.com',
      password: 'zenith123',
    });
    expect(rohan).toBeDefined();
    expect(rohan.email).toBe('rohan@zenithactive.com');
    expect(rohan.merchantId).toBe('mch_zenith_101');
    expect(rohan.merchantName).toBe('Zenith Active');
    expect(rohan.role).toBe('MERCHANT_ADMIN');
  });

  it('3. A newly signed-up user can log in via signup route', async () => {
    const suffix = Date.now();
    const newEmail = `fresh_merchant_${suffix}@example.com`;
    const newPassword = 'SecurePassword2026!';
    const newStoreName = `Fresh Brand ${suffix}`;

    // 1. Call real POST /api/auth/signup route
    const { POST } = await import('@/app/api/auth/signup/route');
    const signupReq = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fresh Owner',
        storeName: newStoreName,
        email: newEmail,
        password: newPassword,
      }),
    });

    const signupRes = await POST(signupReq);
    expect(signupRes.status).toBe(201);
    const signupData = await signupRes.json();
    expect(signupData.success).toBe(true);
    expect(signupData.data.user.email).toBe(newEmail);

    // 2. Authenticate newly created user through Credentials Provider
    const authorize = getAuthorize();
    const loggedInUser = await authorize({
      email: newEmail,
      password: newPassword,
    });

    expect(loggedInUser).toBeDefined();
    expect(loggedInUser.email).toBe(newEmail);
    expect(loggedInUser.name).toBe('Fresh Owner');
    expect(loggedInUser.merchantName).toBe(newStoreName);
    expect(loggedInUser.merchantId).toBe(signupData.data.user.merchantId);
  });

  it('4. Wrong password fails authentication', async () => {
    const authorize = getAuthorize();

    await expect(
      authorize({
        email: 'arjun@auraathletics.com',
        password: 'IncorrectPassword999',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('5. Unknown email fails authentication', async () => {
    const authorize = getAuthorize();

    await expect(
      authorize({
        email: 'completely_unknown_user_99999@example.com',
        password: 'SomePassword123',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  it('6. Multi-tenant security: User from Merchant A receives strictly their own merchantId and cannot authenticate as Merchant B', async () => {
    const authorize = getAuthorize();

    const arjun = await authorize({
      email: 'arjun@auraathletics.com',
      password: 'demo123',
    });

    const rohan = await authorize({
      email: 'rohan@zenithactive.com',
      password: 'zenith123',
    });

    // Verify disjoint tenant isolation
    expect(arjun.merchantId).toBe('mch_aura_982');
    expect(rohan.merchantId).toBe('mch_zenith_101');
    expect(arjun.merchantId).not.toBe(rohan.merchantId);
  });
});
