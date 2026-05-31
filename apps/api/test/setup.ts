import { PrismaClient } from '@roomly/database';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// ── Reset DB before each test suite ─────────────────────────────────────────
// Uses TRUNCATE ... CASCADE for speed (avoids full DROP/CREATE cycle)
beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  // Order matters — child tables first to avoid FK violations
  const tables = [
    'WhatsAppMessage',
    'AdminActionLog',
    'PropertyAnalytics',
    'MealRating',
    'StaffAttendance',
    'PropertyMeterReading',
    'Visitor',
    'Outpass',
    'Asset',
    'Commission',
    'Agreement',
    'DepositSettlement',
    'Escrow',
    'EscrowAccount',
    'Notice',
    'RentRecord',
    'Payment',
    'Complaint',
    'Expense',
    'Booking',
    'KYCRecord',
    'Notification',
    'Session',
    'RefreshToken',
    'Review',
    'FoodMenu',
    'VerificationReport',
    'Tour360',
    'PropertyPhoto',
    'PropertyStaff',
    'Bed',
    'Room',
    'Floor',
    'Property',
    'OwnerProfile',
    'TenantProfile',
    'Subscription',
    'User',
  ];

  await prisma.$transaction(
    tables.map((table) =>
      prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`),
    ),
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
