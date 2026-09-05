import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'RAYFLOW — Digital Commerce Platform',
  description: 'Modern commerce platform featuring customer product discovery, merchant growth controls, and Razorpay checkout integration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
