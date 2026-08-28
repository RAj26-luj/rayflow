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

/**
 * Resolves the authenticated merchant context strictly from the server-side JWT session.
 * Returns null if the request is unauthenticated or session is invalid.
 */
export async function getAuthenticatedMerchant(): Promise<AuthenticatedMerchantContext | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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
  } catch (err) {
    console.error('Failed to resolve authenticated session:', err);
    return null;
  }
}
