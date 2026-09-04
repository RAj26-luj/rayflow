import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting RAYFLOW Database Seed...');

  // 0. Ensure schema columns exist in PostgreSQL by executing single statements
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false;`
    );
  } catch (err) {
    console.warn('Schema sync notice:', err);
  }

  const demoMerchantIds = ['mch_aura_982', 'mch_zenith_101'];
  const demoOrders = await prisma.order.findMany({
    where: { merchantId: { in: demoMerchantIds } },
    select: { id: true },
  });
  const demoOrderIds = demoOrders.map((o) => o.id);

  // Clean demo-specific records in correct relation order so real non-demo merchants are untouched
  await prisma.webhookEvent.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.auditLog.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.payment.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  if (demoOrderIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } });
  }
  await prisma.order.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.campaign.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.revenueOpportunity.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.customer.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.product.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.agentPolicy.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.user.deleteMany({ where: { merchantId: { in: demoMerchantIds } } });
  await prisma.merchant.deleteMany({ where: { id: { in: demoMerchantIds } } });

  // 1. Create Primary Merchant: Aura Athletics
  const passwordHash = await bcrypt.hash('demo123', 10);
  const auraMerchant = await prisma.merchant.create({
    data: {
      id: 'mch_aura_982',
      name: 'Aura Athletics',
      slug: 'aura-athletics',
      email: 'arjun@auraathletics.com',
      isDemo: true,
      users: {
        create: [
          {
            id: 'usr_arjun_982',
            name: 'Arjun Sharma',
            email: 'arjun@auraathletics.com',
            passwordHash,
            role: 'MERCHANT_ADMIN',
          },
          {
            id: 'usr_pooja_982',
            name: 'Pooja Nair',
            email: 'pooja@auraathletics.com',
            passwordHash,
            role: 'MERCHANT_MEMBER',
          },
        ],
      },
      policy: {
        create: {
          maxDiscountPercent: 20.0,
          maxCampaignBudget: 50000.0,
          maxSingleTransaction: 25000.0,
          approvalThresholdDiscount: 15.0,
          approvalThresholdCampaign: 15000.0,
        },
      },
    },
  });

  // 2. Create Secondary Merchant for Multi-Tenancy Isolation Testing
  const zenithPasswordHash = await bcrypt.hash('zenith123', 10);
  const zenithMerchant = await prisma.merchant.create({
    data: {
      id: 'mch_zenith_101',
      name: 'Zenith Active',
      slug: 'zenith-active',
      email: 'rohan@zenithactive.com',
      isDemo: true,
      users: {
        create: [
          {
            id: 'usr_rohan_101',
            name: 'Rohan Varma',
            email: 'rohan@zenithactive.com',
            passwordHash: zenithPasswordHash,
            role: 'MERCHANT_ADMIN',
          },
        ],
      },
      policy: {
        create: {
          maxDiscountPercent: 18.0,
          maxCampaignBudget: 40000.0,
          maxSingleTransaction: 20000.0,
          approvalThresholdDiscount: 12.0,
          approvalThresholdCampaign: 10000.0,
        },
      },
    },
  });

  // 3. Create Products for Aura Athletics
  const p1 = await prisma.product.create({
    data: {
      id: 'prod_velocity_runner',
      merchantId: auraMerchant.id,
      name: 'Velocity Runner Pro',
      sku: 'AA-SHOE-001',
      description: 'High-cushion carbon-plated marathon shoe designed for long distance tempo runs.',
      price: 4999.0,
      compareAtPrice: 5999.0,
      category: 'Footwear',
      inventory: 48,
      conversionRate: 4.2,
      marginPercent: 64.0,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_performance_socks', 'prod_hydration_bottle', 'prod_running_cap']),
    },
  });

  const p2 = await prisma.product.create({
    data: {
      id: 'prod_performance_socks',
      merchantId: auraMerchant.id,
      name: 'Performance Running Socks (3-Pack)',
      sku: 'AA-SOCK-002',
      description: 'Anti-blister moisture-wicking compression socks with arch support.',
      price: 499.0,
      compareAtPrice: 699.0,
      category: 'Accessories',
      inventory: 180,
      conversionRate: 6.8,
      marginPercent: 78.0,
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_velocity_runner']),
    },
  });

  const p3 = await prisma.product.create({
    data: {
      id: 'prod_hydration_bottle',
      merchantId: auraMerchant.id,
      name: 'Ergo Grip Hydration Flask (750ml)',
      sku: 'AA-BTL-003',
      description: 'BPA-free squeezable handheld running water bottle with leak-proof jet valve.',
      price: 799.0,
      compareAtPrice: 999.0,
      category: 'Hydration',
      inventory: 95,
      conversionRate: 5.1,
      marginPercent: 72.0,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_velocity_runner']),
    },
  });

  const p4 = await prisma.product.create({
    data: {
      id: 'prod_running_cap',
      merchantId: auraMerchant.id,
      name: 'Aerolite UV Running Cap',
      sku: 'AA-CAP-004',
      description: 'Ultralight UPF 50+ quick-dry sun protection cap with laser-cut ventilation.',
      price: 999.0,
      compareAtPrice: 1299.0,
      category: 'Accessories',
      inventory: 64,
      conversionRate: 3.8,
      marginPercent: 70.0,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_velocity_runner']),
    },
  });

  const p5 = await prisma.product.create({
    data: {
      id: 'prod_fitness_band',
      merchantId: auraMerchant.id,
      name: 'PulseTrack GPS Cardio Band',
      sku: 'AA-TECH-005',
      description: 'Optic heart-rate & VO2 max telemetry tracker with 14-day battery life.',
      price: 3499.0,
      compareAtPrice: 4499.0,
      category: 'Fitness Tech',
      inventory: 32,
      conversionRate: 2.9,
      marginPercent: 55.0,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_velocity_runner']),
    },
  });

  const p6 = await prisma.product.create({
    data: {
      id: 'prod_running_jacket',
      merchantId: auraMerchant.id,
      name: 'StormShield Windbreaker Jacket',
      sku: 'AA-APP-006',
      description: 'Water-repellent featherweight packable running jacket with 360-degree reflectivity.',
      price: 4299.0,
      compareAtPrice: 5299.0,
      category: 'Apparel',
      inventory: 25,
      conversionRate: 3.1,
      marginPercent: 62.0,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_velocity_runner']),
    },
  });

  const p7 = await prisma.product.create({
    data: {
      id: 'prod_running_backpack',
      merchantId: auraMerchant.id,
      name: 'UltraTrail 12L Vest Backpack',
      sku: 'AA-BAG-007',
      description: 'Ergonomic bounce-free trail running vest with twin front flask holsters.',
      price: 3899.0,
      compareAtPrice: 4899.0,
      category: 'Accessories',
      inventory: 19,
      conversionRate: 2.4,
      marginPercent: 58.0,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      complementaryProductIds: JSON.stringify(['prod_hydration_bottle']),
    },
  });

  // Isolated product for Zenith Active (to test multi-tenant safety)
  await prisma.product.create({
    data: {
      id: 'prod_zenith_yoga_mat',
      merchantId: zenithMerchant.id,
      name: 'Zenith Eco Yoga Mat',
      sku: 'ZA-MAT-001',
      description: 'Natural tree rubber alignment mat.',
      price: 2499.0,
      category: 'Fitness Tech',
      inventory: 50,
      conversionRate: 5.0,
      marginPercent: 70.0,
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    },
  });

  // 4. Create Customers for Aura Athletics
  const customerPasswordHash = await bcrypt.hash('demo123', 10);

  const c1 = await prisma.customer.create({
    data: {
      id: 'cust_rahul_01',
      merchantId: auraMerchant.id,
      name: 'Rahul Mehta',
      email: 'rahul.mehta@example.com',
      phone: '+919820144521',
      passwordHash: customerPasswordHash,
      isDemo: true,
      cohort: 'High-Intent Marathoners',
      lifetimeValue: 14850.0,
      orderCount: 3,
      intentScore: 92,
      cartStatus: 'CHECKOUT_VIEWED',
      notes: 'Viewed Velocity Runner 4x in last 24h. Candidate for instant 15% socks bundle.',
      lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    },
  });

  const c2 = await prisma.customer.create({
    data: {
      id: 'cust_priya_02',
      merchantId: auraMerchant.id,
      name: 'Priya Sharma',
      email: 'priya@auraathletics.com',
      phone: '+919811234567',
      passwordHash: customerPasswordHash,
      isDemo: true,
      cohort: 'Tech Fitness Enthusiasts',
      lifetimeValue: 8499.0,
      orderCount: 2,
      intentScore: 84,
      cartStatus: 'ACTIVE',
      notes: 'Added GPS Cardio band. High affinity with hydration flask.',
      lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
    },
  });

  const c3 = await prisma.customer.create({
    data: {
      id: 'cust_vikram_03',
      merchantId: auraMerchant.id,
      name: 'Vikram Patel',
      email: 'vikram.patel@example.com',
      phone: '+919899887766',
      passwordHash: customerPasswordHash,
      isDemo: true,
      cohort: 'Weekend Runners',
      lifetimeValue: 4999.0,
      orderCount: 1,
      intentScore: 78,
      cartStatus: 'ABANDONED',
      notes: 'Abandoned checkout on StormShield Jacket. Ready for 10% recovery incentive.',
      lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
    },
  });

  const c4 = await prisma.customer.create({
    data: {
      id: 'cust_ananya_04',
      merchantId: auraMerchant.id,
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '+919711223344',
      passwordHash: customerPasswordHash,
      isDemo: true,
      cohort: 'VIP Runners Club',
      lifetimeValue: 24500.0,
      orderCount: 5,
      intentScore: 88,
      cartStatus: 'ACTIVE',
      notes: 'Top tier VIP member. High response rate to early gear drops.',
      lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
  });

  const c5 = await prisma.customer.create({
    data: {
      id: 'cust_sameer_05',
      merchantId: auraMerchant.id,
      name: 'Sameer Joshi',
      email: 'sameer.joshi@example.com',
      phone: '+919655443322',
      passwordHash: customerPasswordHash,
      isDemo: true,
      cohort: 'New Store Visitors',
      lifetimeValue: 0.0,
      orderCount: 0,
      intentScore: 45,
      cartStatus: 'EMPTY',
      notes: 'First time visitor exploring footwear catalogue.',
      lastPurchaseDate: new Date(),
    },
  });

  // 5. Seed 14 Revenue Opportunities for Aura Athletics
  const opportunitiesData = [
    {
      id: 'opp_01',
      title: 'High-Intent Velocity Runner + Socks Bundle',
      subtitle: '127 shoppers viewed Velocity Runner without accessories',
      description: 'Shoppers who view Velocity Runner have a 64% co-purchase affinity for Performance Socks when incentivized with a 15% bundle discount.',
      type: 'UPSELL',
      recommendedAction: 'Attach 15% discount for Performance Socks on Velocity Runner checkout (Save ₹200).',
      reasoning: 'Co-purchase affinity score is 0.64. Gross margin on socks is 78%, preserving 62.8% net bundle margin.',
      expectedRevenue: 63400.0,
      confidence: 94,
      riskLevel: 'LOW',
      affectedCustomerCohort: 'High-Intent Marathoners (127 shoppers)',
      affectedCustomersCount: 127,
      status: 'PENDING',
      actionPayload: JSON.stringify({ primaryProductId: 'prod_velocity_runner', addonProductId: 'prod_performance_socks', discountPercent: 15, maxBudget: 8000 }),
      policyNotes: 'Proposed discount 15% complies with 20% merchant discount cap.',
    },
    {
      id: 'opp_02',
      title: 'StormShield Jacket Cart Abandonment Recovery',
      subtitle: '43 shoppers abandoned cart at payment step',
      description: '43 high-intent users added StormShield Jacket but abandoned at gateway. Automated 10% recovery incentive converts 38% based on historical telemetry.',
      type: 'ABANDONED_CHECKOUT',
      recommendedAction: 'Send 10% 24-hour flash recovery checkout link via Razorpay Payment Link API.',
      reasoning: 'Historical recovery conversion on this cohort is 38.2%. Recovers approx ₹48,200 in gross margin.',
      expectedRevenue: 48200.0,
      confidence: 91,
      riskLevel: 'LOW',
      affectedCustomerCohort: 'Checkout Drop-offs (43 shoppers)',
      affectedCustomersCount: 43,
      status: 'PENDING',
      actionPayload: JSON.stringify({ productId: 'prod_running_jacket', discountPercent: 10, maxBudget: 5000 }),
      policyNotes: '10% discount is well within 20% threshold. Auto-approvable.',
    },
    {
      id: 'opp_03',
      title: 'GPS Cardio Band + Hydration Flask Cross-Sell',
      subtitle: 'Post-purchase sequence for 89 PulseTrack buyers',
      description: 'PulseTrack buyers have high propensity for endurance hydration gear within 14 days of purchase.',
      type: 'CROSS_SELL',
      recommendedAction: 'Trigger 1-click in-app recommendation for Ergo Grip Bottle at ₹699 (₹100 off).',
      reasoning: '89 recent buyers identified. 34% estimated conversion based on workout duration telemetry.',
      expectedRevenue: 28500.0,
      confidence: 88,
      riskLevel: 'LOW',
      affectedCustomerCohort: 'Tech Fitness Enthusiasts (89 buyers)',
      affectedCustomersCount: 89,
      status: 'PENDING',
      actionPayload: JSON.stringify({ productId: 'prod_hydration_bottle', discountPercent: 12, maxBudget: 3500 }),
      policyNotes: 'Complies with merchant policy rules.',
    },
    {
      id: 'opp_04',
      title: 'UltraTrail Backpack Low Conversion Recovery',
      subtitle: '2.4% conversion rate with high bounce rate',
      description: 'The UltraTrail Backpack receives 450 views weekly but converts at only 2.4%. Bundle pairing with Hydration Flask boosts checkout intent by 44%.',
      type: 'LOW_CONVERSION_RECOVERY',
      recommendedAction: 'Bundle Backpack + Flask with ₹400 instant savings.',
      reasoning: 'Increases effective AOV from ₹3,899 to ₹4,298 while clearing 19 units of inventory.',
      expectedRevenue: 34800.0,
      confidence: 86,
      riskLevel: 'LOW',
      affectedCustomerCohort: 'Trail Runners (450 weekly visitors)',
      affectedCustomersCount: 450,
      status: 'PENDING',
      actionPayload: JSON.stringify({ primaryProductId: 'prod_running_backpack', addonProductId: 'prod_hydration_bottle', discountPercent: 14, maxBudget: 6000 }),
      policyNotes: '14% bundle discount is within safety limits.',
    },
    {
      id: 'opp_05',
      title: 'Aerolite UV Cap Pre-Summer Flash Boost',
      subtitle: '180 VIP members due for seasonal re-engagement',
      description: 'Seasonal warming trend triggers 3x demand for sun protection running accessories.',
      type: 'UPSELL',
      recommendedAction: 'Deploy 12% VIP member discount on Aerolite UV Cap.',
      reasoning: 'High customer loyalty cohort with 4.8x average re-order propensity.',
      expectedRevenue: 21600.0,
      confidence: 89,
      riskLevel: 'LOW',
      affectedCustomerCohort: 'VIP Runners Club (180 members)',
      affectedCustomersCount: 180,
      status: 'PENDING',
      actionPayload: JSON.stringify({ productId: 'prod_running_cap', discountPercent: 12, maxBudget: 4000 }),
      policyNotes: 'Within policy limit.',
    },
  ];

  for (const opp of opportunitiesData) {
    await prisma.revenueOpportunity.create({
      data: {
        ...opp,
        merchantId: auraMerchant.id,
      },
    });
  }

  // 6. Seed Campaigns for Aura Athletics
  await prisma.campaign.create({
    data: {
      id: 'camp_01',
      merchantId: auraMerchant.id,
      name: 'Spring Marathon Prep Accelerator',
      targetCohort: 'Customers who viewed marathon shoes in last 60 days',
      discountPercent: 15.0,
      maxBudget: 25000.0,
      estimatedAudience: 2430,
      expectedRevenue: 98500.0,
      convertedOrders: 18,
      status: 'ACTIVE',
      aiReasoning: 'Targets marathoners prior to seasonal race registration with bounded 15% accessories bundle.',
    },
  });

  // 7. Seed Orders & Payments for Aura Athletics
  const o1 = await prisma.order.create({
    data: {
      id: 'ord_01',
      merchantId: auraMerchant.id,
      orderNumber: 'ORD-2026-9901',
      razorpayOrderId: 'order_RAYFlow_9901_test',
      razorpayPaymentId: 'pay_RAYFlow_9901_test',
      customerId: c1.id,
      customerName: c1.name,
      customerEmail: c1.email,
      customerPhone: c1.phone,
      subtotalAmount: 5498.0,
      discountAmount: 200.0,
      totalAmount: 5298.0,
      status: 'PAID',
      paymentMethod: 'upi',
      isBundle: true,
      bundleSavings: 200.0,
      items: {
        create: [
          { productId: p1.id, productName: p1.name, quantity: 1, unitPrice: 4999.0, totalAmount: 4999.0 },
          { productId: p2.id, productName: p2.name, quantity: 1, unitPrice: 499.0, totalAmount: 499.0 },
        ],
      },
      payments: {
        create: {
          merchantId: auraMerchant.id,
          razorpayPaymentId: 'pay_RAYFlow_9901_test',
          razorpayOrderId: 'order_RAYFlow_9901_test',
          amount: 5298.0,
          currency: 'INR',
          status: 'CAPTURED',
          method: 'upi',
          email: c1.email,
          contact: c1.phone,
          signature: 'sig_valid_test_sha256_9901',
          signatureVerified: true,
        },
      },
    },
  });

  // 8. Seed Initial Audit Logs for Aura Athletics
  await prisma.auditLog.create({
    data: {
      merchantId: auraMerchant.id,
      actorId: 'system',
      actorName: 'System',
      agentName: 'Revenue Assistant',
      actionType: 'OPPORTUNITY_CREATED',
      entityType: 'OPPORTUNITY',
      entityId: 'opp_01',
      amount: 63400.0,
      policyCheck: 'PASSED',
      approval: 'AUTO_APPROVED',
      result: 'SUCCESS',
      reason: 'Calculated 15% bundle discount for Velocity Runner + Socks under 20% merchant cap.',
      metadata: JSON.stringify({ confidence: 94, coPurchaseAffinity: 0.64 }),
    },
  });

  await prisma.auditLog.create({
    data: {
      merchantId: auraMerchant.id,
      actorId: c1.id,
      actorName: c1.name,
      agentName: 'Shopping Assistant',
      actionType: 'ORDER_CREATED',
      entityType: 'ORDER',
      entityId: o1.id,
      amount: 5298.0,
      policyCheck: 'PASSED',
      approval: 'AUTO_APPROVED',
      result: 'SUCCESS',
      reason: 'Customer completed checkout for Velocity Runner bundle.',
      metadata: JSON.stringify({ orderNumber: o1.orderNumber, rzpOrderId: o1.razorpayOrderId }),
    },
  });

  await prisma.auditLog.create({
    data: {
      merchantId: auraMerchant.id,
      actorId: 'razorpay_gateway',
      actorName: 'Razorpay Test Gateway',
      agentName: 'Razorpay Gateway',
      actionType: 'PAYMENT_CAPTURED',
      entityType: 'PAYMENT',
      entityId: 'pay_RAYFlow_9901_test',
      amount: 5298.0,
      policyCheck: 'PASSED',
      approval: 'AUTO_APPROVED',
      result: 'SUCCESS',
      reason: 'Razorpay payment captured and signature verified server-side.',
      metadata: JSON.stringify({ paymentId: 'pay_RAYFlow_9901_test', method: 'upi' }),
    },
  });

  console.log('✅ RAYFLOW Database successfully seeded with merchants, products, opportunities, orders & audit logs!');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
