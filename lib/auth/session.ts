import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { prisma } from '@/lib/db/prisma';

export interface AuthenticatedMerchantContext {
  userId: string;
  userEmail: string;
  userName: string;
  merchantId: string;
  merchantName: string;
  role: string;
}

export interface AuthenticatedCustomerContext {
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  merchantId: string;
  merchantName: string;
  role: 'CUSTOMER';
}

/**
 * Resolves the authenticated merchant context strictly from the server-side JWT session.
 * Returns null if the request is unauthenticated, session is invalid, or user is a customer.
 */
export async function getAuthenticatedMerchant(): Promise<AuthenticatedMerchantContext | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const tokenRole = (session.user as any).role;
    const tokenUserType = (session.user as any).userType;

    // Reject customer sessions from accessing merchant APIs
    if (tokenRole === 'CUSTOMER' || tokenUserType === 'CUSTOMER') {
      return null;
    }

    const tokenMerchantId = (session.user as any).merchantId;
    const tokenUserId = (session.user as any).id;
    const tokenEmail = session.user.email?.toLowerCase().trim();

    if (!tokenMerchantId && !tokenEmail) {
      return null;
    }

    // Verify user & merchant directly against the database to guarantee referential integrity
    let user = null;
    if (tokenUserId) {
      user = await prisma.user.findUnique({
        where: { id: tokenUserId },
        include: { merchant: true },
      });
    }

    if (!user && tokenEmail) {
      user = await prisma.user.findUnique({
        where: { email: tokenEmail },
        include: { merchant: true },
      });
    }

    if (!user || !user.merchant) {
      return null;
    }

    // Verify tenant integrity: if token claimed a specific merchantId, ensure user belongs to it
    if (tokenMerchantId && user.merchantId !== tokenMerchantId && user.merchant.id !== tokenMerchantId) {
      return null;
    }

    return {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      merchantId: user.merchant.id,
      merchantName: user.merchant.name,
      role: user.role,
    };
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to resolve authenticated session:', err?.message || err);
    }
    return null;
  }
}

/**
 * Resolves the authenticated customer context strictly from the server-side JWT session.
 * Returns null if the request is unauthenticated or user is not a customer.
 */
export async function getAuthenticatedCustomer(): Promise<AuthenticatedCustomerContext | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const tokenCustomerId = (session.user as any).customerId || (session.user as any).id;
    const tokenEmail = session.user.email?.toLowerCase().trim();

    if (!tokenCustomerId && !tokenEmail) {
      return null;
    }

    let customer = null;
    if (tokenCustomerId) {
      customer = await prisma.customer.findUnique({
        where: { id: tokenCustomerId },
        include: { merchant: true },
      });
    }

    if (!customer && tokenEmail) {
      customer = await prisma.customer.findFirst({
        where: { email: tokenEmail },
        include: { merchant: true },
      });
    }

    if (!customer) {
      return null;
    }

    return {
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      merchantId: customer.merchantId,
      merchantName: customer.merchant?.name || 'Store',
      role: 'CUSTOMER',
    };
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to resolve customer session:', err?.message || err);
    }
    return null;
  }
}
