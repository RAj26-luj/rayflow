import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export const dynamic = 'force-dynamic';

const handler = (req: any, ctx: any) => {
  return NextAuth(req, ctx, authOptions);
};

export { handler as GET, handler as POST };
