/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV === 'production'
        ? 'https://rayflow-omega.vercel.app'
        : 'http://localhost:3000'),
  },
  images: {
    domains: ['images.unsplash.com', 'assets.razorpay.com'],
  },
};

module.exports = nextConfig;
