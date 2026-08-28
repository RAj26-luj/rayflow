import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'RAYFLOW — AI Revenue Agent for Agentic Commerce',
  description: 'Bounded AI Revenue Agent powered by Razorpay test-mode commerce and policy safety guards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
