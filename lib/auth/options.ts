import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'rayflow_production_super_secret_jwt_encryption_key_2026',
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' }, // 'customer' | 'merchant' | 'auto'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const requestedType = credentials.userType || 'auto';

        // 1. If explicitly customer or auto, try Customer authentication
        if (requestedType === 'customer' || requestedType === 'auto') {
          const customer = await prisma.customer.findFirst({
            where: { email: normalizedEmail },
            include: { merchant: true },
          });

          if (customer && customer.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, customer.passwordHash);
            if (isValid) {
              return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                customerId: customer.id,
                merchantId: customer.merchantId,
                merchantName: customer.merchant?.name || 'Store',
                role: 'CUSTOMER',
                userType: 'CUSTOMER',
              };
            }
          }
        }

        // 2. If explicitly merchant or auto, try Merchant User authentication
        if (requestedType === 'merchant' || requestedType === 'auto') {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { merchant: true },
          });

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                merchantId: user.merchantId,
                merchantName: user.merchant?.name || 'Store',
                role: user.role,
                userType: 'MERCHANT',
              };
            }
          }
        }

        throw new Error('Invalid email or password');
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Determine effective base URL from environment or request origin
      const defaultProdUrl = 'https://rayflow-omega.vercel.app';
      const effectiveBaseUrl =
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : null) ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        baseUrl ||
        (process.env.NODE_ENV === 'production' ? defaultProdUrl : 'http://localhost:3000');

      // Relative URLs (e.g., "/" or "/overview" or "/shop")
      if (url.startsWith('/')) {
        const cleanBase = effectiveBaseUrl.replace(/\/+$/, '');
        return url === '/' ? cleanBase : `${cleanBase}${url}`;
      }

      // Absolute URLs on the same origin or allowed vercel.app domains
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(effectiveBaseUrl);
        if (
          parsedUrl.origin === parsedBase.origin ||
          parsedUrl.hostname === 'rayflow-omega.vercel.app' ||
          parsedUrl.hostname.endsWith('.vercel.app')
        ) {
          return url;
        }
      } catch {
        // Fallback on malformed URL
      }

      return effectiveBaseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.customerId = (user as any).customerId;
        token.merchantId = (user as any).merchantId;
        token.merchantName = (user as any).merchantName;
        token.role = (user as any).role;
        token.userType = (user as any).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).customerId = token.customerId as string;
        (session.user as any).merchantId = token.merchantId as string;
        (session.user as any).merchantName = token.merchantName as string;
        (session.user as any).role = token.role as string;
        (session.user as any).userType = token.userType as string;
      }
      return session;
    },
  },
};
