import bcrypt from 'bcryptjs';

export function createMockPrisma() {
  const merchants = new Map<string, any>();
  const users = new Map<string, any>();
  const customers = new Map<string, any>();
  const products = new Map<string, any>();
  const agentPolicies = new Map<string, any>();
  const revenueOpportunities = new Map<string, any>();
  const simulationRuns = new Map<string, any>();
  const campaigns = new Map<string, any>();
  const orders = new Map<string, any>();
  const orderItems = new Map<string, any>();
  const payments = new Map<string, any>();
  const auditLogs = new Map<string, any>();
  const webhookEvents = new Map<string, any>();

  // Helper to generate unique IDs
  const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  // Seed default demo merchants and users synchronously for tests
  const defaultPassHash = bcrypt.hashSync('demo123', 10);
  const zenithPassHash = bcrypt.hashSync('zenith123', 10);

  // Aura Athletics
  merchants.set('mch_aura_982', {
    id: 'mch_aura_982',
    name: 'Aura Athletics',
    slug: 'aura-athletics',
    email: 'arjun@auraathletics.com',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  users.set('usr_arjun_982', {
    id: 'usr_arjun_982',
    merchantId: 'mch_aura_982',
    name: 'Arjun Sharma',
    email: 'arjun@auraathletics.com',
    passwordHash: defaultPassHash,
    role: 'MERCHANT_ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  users.set('usr_pooja_982', {
    id: 'usr_pooja_982',
    merchantId: 'mch_aura_982',
    name: 'Pooja Nair',
    email: 'pooja@auraathletics.com',
    passwordHash: defaultPassHash,
    role: 'MERCHANT_MEMBER',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  agentPolicies.set('pol_aura_982', {
    id: 'pol_aura_982',
    merchantId: 'mch_aura_982',
    maxDiscountPercent: 20.0,
    maxCampaignBudget: 50000.0,
    maxSingleTransaction: 25000.0,
    approvalThresholdDiscount: 15.0,
    approvalThresholdCampaign: 15000.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  customers.set('cst_priya_982', {
    id: 'cst_priya_982',
    merchantId: 'mch_aura_982',
    name: 'Priya Sharma',
    email: 'priya@auraathletics.com',
    phone: '+919876543210',
    passwordHash: defaultPassHash,
    cohort: 'VIP High-Intent',
    intentScore: 92,
    cartStatus: 'ACTIVE',
    orderCount: 3,
    lifetimeValue: 14500.0,
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Zenith Active
  merchants.set('mch_zenith_101', {
    id: 'mch_zenith_101',
    name: 'Zenith Active',
    slug: 'zenith-active',
    email: 'rohan@zenithactive.com',
    isDemo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  users.set('usr_rohan_101', {
    id: 'usr_rohan_101',
    merchantId: 'mch_zenith_101',
    name: 'Rohan Varma',
    email: 'rohan@zenithactive.com',
    passwordHash: zenithPassHash,
    role: 'MERCHANT_ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  agentPolicies.set('pol_zenith_101', {
    id: 'pol_zenith_101',
    merchantId: 'mch_zenith_101',
    maxDiscountPercent: 18.0,
    maxCampaignBudget: 40000.0,
    maxSingleTransaction: 20000.0,
    approvalThresholdDiscount: 12.0,
    approvalThresholdCampaign: 10000.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Generic matcher
  const matchesWhere = (item: any, where: any): boolean => {
    if (!where) return true;
    for (const [key, val] of Object.entries(where)) {
      if (val === undefined) continue;

      if (key === 'OR' && Array.isArray(val)) {
        const matchesAny = val.some((subWhere) => matchesWhere(item, subWhere));
        if (!matchesAny) return false;
        continue;
      }
      if (key === 'AND' && Array.isArray(val)) {
        const matchesAll = val.every((subWhere) => matchesWhere(item, subWhere));
        if (!matchesAll) return false;
        continue;
      }
      if (key === 'NOT') {
        if (matchesWhere(item, val)) return false;
        continue;
      }

      // Compound keys (e.g., merchantId_email)
      if (key === 'merchantId_email' && typeof val === 'object' && val !== null) {
        if (item.merchantId !== (val as any).merchantId || item.email !== (val as any).email) {
          return false;
        }
        continue;
      }

      if (typeof val === 'object' && val !== null) {
        if ('in' in val && Array.isArray((val as any).in)) {
          if (!(val as any).in.includes(item[key])) return false;
          continue;
        }
        if ('notIn' in val && Array.isArray((val as any).notIn)) {
          if ((val as any).notIn.includes(item[key])) return false;
          continue;
        }
        if ('contains' in val && typeof item[key] === 'string') {
          const mode = (val as any).mode;
          const search = (val as any).contains;
          if (mode === 'insensitive') {
            if (!item[key].toLowerCase().includes(search.toLowerCase())) return false;
          } else {
            if (!item[key].includes(search)) return false;
          }
          continue;
        }
        if ('gte' in val) {
          if (item[key] < (val as any).gte) return false;
          continue;
        }
        if ('lte' in val) {
          if (item[key] > (val as any).lte) return false;
          continue;
        }
        if ('gt' in val) {
          if (item[key] <= (val as any).gt) return false;
          continue;
        }
        if ('lt' in val) {
          if (item[key] >= (val as any).lt) return false;
          continue;
        }
        if ('equals' in val) {
          if (item[key] !== (val as any).equals) return false;
          continue;
        }
        if ('not' in val) {
          if (item[key] === (val as any).not) return false;
          continue;
        }
      }

      if (item[key] !== val) return false;
    }
    return true;
  };

  const applyInclude = (item: any, include: any) => {
    if (!item || !include) return item;
    const cloned = { ...item };

    if (include.users) {
      cloned.users = Array.from(users.values()).filter((u) => u.merchantId === item.id);
    }
    if (include.merchant) {
      cloned.merchant = merchants.get(item.merchantId) || null;
    }
    if (include.policy) {
      cloned.policy = Array.from(agentPolicies.values()).find((p) => p.merchantId === item.id) || null;
    }
    if (include.items) {
      cloned.items = Array.from(orderItems.values()).filter((oi) => oi.orderId === item.id);
    }
    if (include.customer) {
      cloned.customer = item.customerId ? customers.get(item.customerId) || null : null;
    }
    if (include.payments) {
      cloned.payments = Array.from(payments.values()).filter((p) => p.orderId === item.id);
    }
    return cloned;
  };

  const createModelHandler = (map: Map<string, any>, prefix: string) => ({
    create: async ({ data, include }: { data: any; include?: any }) => {
      const id = data.id || genId(prefix);
      const now = new Date();
      const record = { id, createdAt: now, updatedAt: now, ...data };

      // Handle nested creates
      if (data.users?.create) {
        delete record.users;
        const uList = Array.isArray(data.users.create) ? data.users.create : [data.users.create];
        for (const u of uList) {
          const uId = u.id || genId('usr');
          users.set(uId, { id: uId, merchantId: id, createdAt: now, updatedAt: now, ...u });
        }
      }
      if (data.policy?.create) {
        delete record.policy;
        const pId = genId('pol');
        agentPolicies.set(pId, { id: pId, merchantId: id, createdAt: now, updatedAt: now, ...data.policy.create });
      }
      if (data.products?.create) {
        delete record.products;
        const prodList = Array.isArray(data.products.create) ? data.products.create : [data.products.create];
        for (const pr of prodList) {
          const prId = pr.id || genId('prod');
          products.set(prId, { id: prId, merchantId: id, createdAt: now, updatedAt: now, ...pr });
        }
      }
      if (data.items?.create) {
        delete record.items;
        const iList = Array.isArray(data.items.create) ? data.items.create : [data.items.create];
        for (const it of iList) {
          const itId = it.id || genId('oi');
          orderItems.set(itId, { id: itId, orderId: id, createdAt: now, updatedAt: now, ...it });
        }
      }

      map.set(id, record);
      return applyInclude(record, include);
    },

    createMany: async ({ data }: { data: any[] }) => {
      const list = Array.isArray(data) ? data : [data];
      const now = new Date();
      for (const item of list) {
        const id = item.id || genId(prefix);
        map.set(id, { id, createdAt: now, updatedAt: now, ...item });
      }
      return { count: list.length };
    },

    findUnique: async ({ where, include }: { where: any; include?: any }) => {
      for (const item of map.values()) {
        if (matchesWhere(item, where)) {
          return applyInclude(item, include);
        }
      }
      return null;
    },

    findFirst: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any }) => {
      let results = Array.from(map.values()).filter((item) => matchesWhere(item, where));
      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const dir = orderBy[key];
        results.sort((a, b) => {
          if (dir === 'desc') return b[key] > a[key] ? 1 : -1;
          return a[key] > b[key] ? 1 : -1;
        });
      }
      return results.length > 0 ? applyInclude(results[0], include) : null;
    },

    findMany: async ({ where, orderBy, take, skip, include }: { where?: any; orderBy?: any; take?: number; skip?: number; include?: any } = {}) => {
      let results = Array.from(map.values()).filter((item) => matchesWhere(item, where));
      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const dir = orderBy[key];
        results.sort((a, b) => {
          if (dir === 'desc') return b[key] > a[key] ? 1 : -1;
          return a[key] > b[key] ? 1 : -1;
        });
      }
      if (skip) results = results.slice(skip);
      if (take) results = results.slice(0, take);
      return results.map((r) => applyInclude(r, include));
    },

    update: async ({ where, data, include }: { where: any; data: any; include?: any }) => {
      let target: any = null;
      for (const item of map.values()) {
        if (matchesWhere(item, where)) {
          target = item;
          break;
        }
      }
      if (!target) throw new Error(`Record to update not found in ${prefix}`);

      // Handle increment / decrement operators
      const updated = { ...target, updatedAt: new Date() };
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'object' && v !== null && 'increment' in (v as any)) {
          updated[k] = (target[k] || 0) + (v as any).increment;
        } else if (typeof v === 'object' && v !== null && 'decrement' in (v as any)) {
          updated[k] = (target[k] || 0) - (v as any).decrement;
        } else {
          updated[k] = v;
        }
      }
      map.set(target.id, updated);
      return applyInclude(updated, include);
    },

    updateMany: async ({ where, data }: { where: any; data: any }) => {
      let count = 0;
      for (const item of map.values()) {
        if (matchesWhere(item, where)) {
          map.set(item.id, { ...item, ...data, updatedAt: new Date() });
          count++;
        }
      }
      return { count };
    },

    upsert: async ({ where, create, update, include }: { where: any; create: any; update: any; include?: any }) => {
      let existing: any = null;
      for (const item of map.values()) {
        if (matchesWhere(item, where)) {
          existing = item;
          break;
        }
      }
      if (existing) {
        const updated = { ...existing, updatedAt: new Date() };
        for (const [k, v] of Object.entries(update)) {
          if (typeof v === 'object' && v !== null && 'increment' in (v as any)) {
            updated[k] = (existing[k] || 0) + (v as any).increment;
          } else {
            updated[k] = v;
          }
        }
        map.set(existing.id, updated);
        return applyInclude(updated, include);
      } else {
        const id = create.id || genId(prefix);
        const now = new Date();
        const created = { id, createdAt: now, updatedAt: now, ...create };
        map.set(id, created);
        return applyInclude(created, include);
      }
    },

    delete: async ({ where }: { where: any }) => {
      for (const item of map.values()) {
        if (matchesWhere(item, where)) {
          map.delete(item.id);
          return item;
        }
      }
      throw new Error(`Record to delete not found in ${prefix}`);
    },

    deleteMany: async ({ where }: { where?: any } = {}) => {
      let count = 0;
      if (!where || Object.keys(where).length === 0) {
        count = map.size;
        map.clear();
        return { count };
      }
      for (const item of Array.from(map.values())) {
        if (matchesWhere(item, where)) {
          map.delete(item.id);
          count++;
        }
      }
      return { count };
    },

    count: async ({ where }: { where?: any } = {}) => {
      return Array.from(map.values()).filter((item) => matchesWhere(item, where)).length;
    },
  });

  const mockInstance = {
    merchant: createModelHandler(merchants, 'mch'),
    user: createModelHandler(users, 'usr'),
    customer: createModelHandler(customers, 'cst'),
    product: createModelHandler(products, 'prod'),
    agentPolicy: createModelHandler(agentPolicies, 'pol'),
    revenueOpportunity: createModelHandler(revenueOpportunities, 'opp'),
    simulationRun: createModelHandler(simulationRuns, 'sim'),
    campaign: createModelHandler(campaigns, 'cmp'),
    order: createModelHandler(orders, 'ord'),
    orderItem: createModelHandler(orderItems, 'oi'),
    payment: createModelHandler(payments, 'pay'),
    auditLog: createModelHandler(auditLogs, 'aud'),
    webhookEvent: createModelHandler(webhookEvents, 'evt'),

    $transaction: async (arg: any) => {
      if (typeof arg === 'function') {
        return await arg(mockInstance);
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return arg;
    },

    $queryRaw: async () => [{ 1: 1 }],
    $executeRawUnsafe: async () => 1,
    $executeRaw: async () => 1,
    $connect: async () => {},
    $disconnect: async () => {},
  };

  return mockInstance;
}
