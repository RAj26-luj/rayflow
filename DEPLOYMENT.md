# RAYFLOW Deployment Guide

RAYFLOW is production-ready for deployment to Vercel, AWS ECS, Railway, Render, or any standard Node.js container environment.

## 1. Zero-Friction Vercel Deployment

1. Push your repository to GitHub.
2. Import project into Vercel.
3. Configure Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. Supabase, Neon, AWS RDS) or file SQLite.
   - `NEXTAUTH_SECRET`: Random 32+ character string.
   - `NEXTAUTH_URL`: Your deployed production URL (e.g. `https://rayflow.vercel.app`).
   - `RAZORPAY_KEY_ID`: Razorpay Test / Live Key ID.
   - `RAZORPAY_KEY_SECRET`: Razorpay Key Secret.
   - `RAZORPAY_WEBHOOK_SECRET`: Razorpay Webhook Secret.
   - `DEMO_MODE`: Set to `true` for demo evaluation or `false` for strict production.

4. Deploy! Next.js build will automatically run `prisma generate && next build`.

---

## 2. Docker Deployment

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY .next ./.next
COPY public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 3. Database Migration Run
On first startup, run:
```bash
npm run prisma:migrate
npm run prisma:seed
```
