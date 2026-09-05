import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'RAYFLOW — Commerce Platform',
  description: 'Premium commerce experience featuring customer discovery, merchant growth controls, and Razorpay checkout.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-purple-900 selection:text-pink-200">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
