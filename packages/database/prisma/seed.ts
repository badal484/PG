import { PrismaClient, UserRole, SubscriptionTier, SubscriptionStatus, PropertyTier, VerificationStatus, BedStatus, RentStatus, ComplaintStatus, ComplaintCategory, PhotoType, StayType, BookingStatus, KYCStatus, DepositStatus, RentPaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Super Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@roomly.in',
      phone: '+919999999999',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      isVerified: true,
    }
  });

  // 2. Owner with Profile & Subscription
  const owner = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      phone: '+918888888888',
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: UserRole.OWNER,
      isActive: true,
      ownerProfile: {
        create: {
          companyName: 'Sharma Coliving Pvt Ltd',
          subscriptionTier: SubscriptionTier.PRO,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          isVerified: true,
        }
      }
    }
  });

  // 3. Properties (Premium 140 beds, Standard 80 beds)
  const premiumProperty = await prisma.property.create({
    data: {
      ownerId: owner.id,
      name: 'Sharma Premium Coliving',
      slug: 'sharma-premium-coliving-kundalahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560037',
      addressLine1: 'Kundalahalli Gate',
      propertyStyle: 'MODERN_COLIVING',
      genderPolicy: 'UNISEX_SEPARATED',
      audienceTarget: 'WORKING_PROFESSIONALS',
      tier: PropertyTier.VERIFIED_PREMIUM,
      verificationStatus: VerificationStatus.VERIFIED,
      totalBeds: 140,
      rentCollectionMethod: 'ONLINE',
      hasWifi: true,
      hasAC: true,
      hasFood: true,
      mealsPerDay: 3,
    }
  });

  const standardProperty = await prisma.property.create({
    data: {
      ownerId: owner.id,
      name: 'Sharma PG for Gents',
      slug: 'sharma-pg-gents-kundalahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560037',
      addressLine1: 'AECS Layout, Kundalahalli',
      propertyStyle: 'TRADITIONAL_PG',
      genderPolicy: 'GENTS_ONLY',
      audienceTarget: 'STUDENTS',
      tier: PropertyTier.VERIFIED_STANDARD,
      verificationStatus: VerificationStatus.VERIFIED,
      totalBeds: 80,
      rentCollectionMethod: 'BOTH',
      hasWifi: true,
      hasFood: true,
      mealsPerDay: 3,
    }
  });

  // 4. Floors, Rooms, Beds for Premium Property
  for (let i = 1; i <= 4; i++) {
    const floor = await prisma.floor.create({
      data: { propertyId: premiumProperty.id, floorNumber: i, floorName: `Floor ${i}` }
    });

    for (let j = 1; j <= 4; j++) {
      const room = await prisma.room.create({
        data: {
          floorId: floor.id,
          propertyId: premiumProperty.id,
          roomNumber: `${i}0${j}`,
          sharingType: 'DOUBLE',
          bathroomType: 'ATTACHED',
          balconyType: 'CLOSED',
          hasAC: true,
        }
      });

      for (let k = 1; k <= 2; k++) {
        await prisma.bed.create({
          data: {
            roomId: room.id,
            propertyId: premiumProperty.id,
            bedNumber: `${i}0${j}-${k}`,
            monthlyRent: 12000,
            depositAmount: 12000,
            status: BedStatus.VACANT,
          }
        });
      }
    }
  }

  // 5. Managers
  for (let i = 1; i <= 3; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i}@roomly.in`,
        phone: `+91777777777${i}`,
        firstName: `Manager`,
        lastName: `${i}`,
        role: UserRole.MANAGER,
        isActive: true,
      }
    });
    await prisma.propertyStaff.create({
      data: {
        propertyId: premiumProperty.id,
        userId: manager.id,
        role: UserRole.MANAGER,
      }
    });
  }

  // 6. Tenants & Bookings
  const tenantBed = await prisma.bed.findFirst({ where: { status: BedStatus.VACANT } });
  if (tenantBed) {
    const tenant = await prisma.user.create({
      data: {
        email: 'tenant1@example.com',
        phone: '+919988776655',
        firstName: 'Ankit',
        lastName: 'Kumar',
        role: UserRole.TENANT,
        tenantProfile: {
          create: { occupation: 'Software Engineer', employerName: 'Tech Corp' }
        }
      }
    });

    const booking = await prisma.booking.create({
      data: {
        bedId: tenantBed.id,
        propertyId: premiumProperty.id,
        tenantId: tenant.id,
        ownerId: owner.id,
        stayType: StayType.LONG_TERM,
        moveInDate: new Date(),
        status: BookingStatus.CONFIRMED,
        monthlyRent: 12000,
        depositAmount: 12000,
        platformFee: 500,
        commissionAmount: 1200,
        commissionRate: 10,
        depositStatus: DepositStatus.HELD,
      }
    });

    await prisma.bed.update({
      where: { id: tenantBed.id },
      data: { status: BedStatus.OCCUPIED, currentTenantId: tenant.id }
    });

    await prisma.rentRecord.create({
      data: {
        bookingId: booking.id,
        tenantId: tenant.id,
        propertyId: premiumProperty.id,
        bedId: tenantBed.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dueDate: new Date(),
        amount: 12000,
        status: RentStatus.PAID,
        paymentMethod: RentPaymentMethod.ONLINE
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
