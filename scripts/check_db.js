const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  for (const u of users) {
    const isDemo123Match = u.passwordHash ? await bcrypt.compare('demo123', u.passwordHash) : false;
    console.log(`- ${u.email} (Role: ${u.role}, PasswordMatches 'demo123': ${isDemo123Match})`);
  }

  const customers = await prisma.customer.findMany();
  console.log('\nCustomers in DB:');
  for (const c of customers) {
    const isDemo123Match = c.passwordHash ? await bcrypt.compare('demo123', c.passwordHash) : false;
    console.log(`- ${c.email} (${c.name}, PasswordMatches 'demo123': ${isDemo123Match})`);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
