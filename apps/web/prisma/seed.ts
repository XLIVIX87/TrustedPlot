import { PrismaClient, UserRole, SellerType, PropertyType, ListingType, ListingStatus, DocumentType, VerificationStatus, BadgeType, InspectionStatus, EscrowStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TrustedPlot database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create users
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@trustedplot.com' },
    update: {},
    create: {
      email: 'buyer@trustedplot.com',
      name: 'Adebayo Buyer',
      passwordHash,
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@trustedplot.com' },
    update: {},
    create: {
      email: 'seller@trustedplot.com',
      name: 'Chinedu Seller',
      passwordHash,
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  const mandate = await prisma.user.upsert({
    where: { email: 'mandate@trustedplot.com' },
    update: {},
    create: {
      email: 'mandate@trustedplot.com',
      name: 'Fatima Mandate',
      passwordHash,
      role: 'MANDATE',
      status: 'ACTIVE',
    },
  });

  const legalOps = await prisma.user.upsert({
    where: { email: 'legal@trustedplot.com' },
    update: {},
    create: {
      email: 'legal@trustedplot.com',
      name: 'Ngozi Legal',
      passwordHash,
      role: 'LEGAL_OPS',
      status: 'ACTIVE',
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@trustedplot.com' },
    update: {},
    create: {
      email: 'inspector@trustedplot.com',
      name: 'Emeka Inspector',
      passwordHash,
      role: 'INSPECTOR',
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@trustedplot.com' },
    update: {},
    create: {
      email: 'admin@trustedplot.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create seller profile
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      sellerType: 'INDIVIDUAL',
      displayName: 'Chinedu Properties',
      kycStatus: 'VERIFIED',
      phone: '+234 800 123 4567',
    },
  });

  // Create listings
  const listing1 = await prisma.listing.create({
    data: {
      sellerProfileId: sellerProfile.id,
      title: '3 Bedroom Apartment in Lekki Phase 1',
      description: 'Well-finished 3 bedroom apartment with modern amenities in a secure estate in Lekki Phase 1. Features include 24/7 power supply, swimming pool, gym, and covered parking.',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki Phase 1',
      price: BigInt(120000000),
      bedrooms: 3,
      bathrooms: 3,
      status: 'VERIFIED',
      visibility: 'PUBLIC',
      badge: 'VERIFIED_GOLD',
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      sellerProfileId: sellerProfile.id,
      title: 'Luxury 5 Bedroom Duplex in Maitama',
      description: 'Exquisite 5 bedroom fully detached duplex in the heart of Maitama, Abuja. Sitting on 800sqm of land with BQ, garden, and ample parking space.',
      propertyType: 'HOUSE',
      listingType: 'SALE',
      city: 'Abuja',
      district: 'Maitama',
      price: BigInt(450000000),
      bedrooms: 5,
      bathrooms: 5,
      status: 'CONDITIONAL',
      visibility: 'PUBLIC',
      badge: 'CONDITIONAL',
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      sellerProfileId: sellerProfile.id,
      title: 'Commercial Land in Victoria Island',
      description: 'Prime commercial land measuring 2000sqm on a major road in Victoria Island. Ideal for office complex or mixed-use development.',
      propertyType: 'LAND',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Victoria Island',
      price: BigInt(800000000),
      status: 'DRAFT',
      visibility: 'PRIVATE',
      badge: 'NONE',
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      sellerProfileId: sellerProfile.id,
      title: '2 Bedroom Flat for Rent in Wuse 2',
      description: 'Newly renovated 2 bedroom flat in a quiet neighborhood in Wuse 2. Close to major roads and amenities.',
      propertyType: 'APARTMENT',
      listingType: 'RENT',
      city: 'Abuja',
      district: 'Wuse 2',
      price: BigInt(3500000),
      bedrooms: 2,
      bathrooms: 2,
      status: 'SUBMITTED',
      visibility: 'PRIVATE',
      badge: 'NONE',
    },
  });

  // Create documents
  await prisma.listingDocument.create({
    data: {
      listingId: listing1.id,
      documentType: 'CERTIFICATE_OF_OCCUPANCY',
      storageKey: 'documents/seed/cof-o-sample.pdf',
      originalFilename: 'certificate-of-occupancy.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048000,
      uploadedByUserId: seller.id,
      status: 'AVAILABLE',
    },
  });

  await prisma.listingDocument.create({
    data: {
      listingId: listing1.id,
      documentType: 'SURVEY_PLAN',
      storageKey: 'documents/seed/survey-plan-sample.pdf',
      originalFilename: 'survey-plan.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024000,
      uploadedByUserId: seller.id,
      status: 'AVAILABLE',
    },
  });

  // Create verification cases
  const verCase1 = await prisma.verificationCase.create({
    data: {
      listingId: listing1.id,
      submittedByUserId: seller.id,
      status: 'APPROVED',
      slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  await prisma.verificationDecision.create({
    data: {
      verificationCaseId: verCase1.id,
      reviewerUserId: legalOps.id,
      decision: 'APPROVED',
      badgeType: 'VERIFIED_GOLD',
      reason: 'All documents verified. C of O and survey plan are valid and consistent.',
    },
  });

  const verCase2 = await prisma.verificationCase.create({
    data: {
      listingId: listing4.id,
      submittedByUserId: seller.id,
      status: 'PENDING',
      slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  // Create inspection
  const inspection = await prisma.inspectionBooking.create({
    data: {
      listingId: listing1.id,
      buyerUserId: buyer.id,
      inspectorUserId: inspector.id,
      slotAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'ASSIGNED',
    },
  });

  // Create escrow
  const escrow = await prisma.escrowCase.create({
    data: {
      listingId: listing1.id,
      buyerUserId: buyer.id,
      sellerUserId: seller.id,
      amount: BigInt(120000000),
      status: 'CREATED',
    },
  });

  await prisma.escrowEvent.create({
    data: {
      escrowCaseId: escrow.id,
      eventType: 'CREATED',
      createdByUserId: buyer.id,
    },
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: seller.id,
        actionType: 'LISTING_CREATED',
        entityType: 'Listing',
        entityId: listing1.id,
      },
      {
        actorUserId: legalOps.id,
        actionType: 'VERIFICATION_DECISION',
        entityType: 'VerificationCase',
        entityId: verCase1.id,
        metadata: { decision: 'APPROVED' },
      },
      {
        actorUserId: buyer.id,
        actionType: 'ESCROW_CREATED',
        entityType: 'EscrowCase',
        entityId: escrow.id,
      },
    ],
  });

  // Create AI usage logs
  await prisma.aIUsageLog.createMany({
    data: [
      {
        userId: buyer.id,
        featureType: 'DOCUMENT_SUMMARY',
        status: 'SUCCESS',
        latencyMs: 2340,
        tokenUsage: 450,
      },
      {
        userId: buyer.id,
        featureType: 'DOCUMENT_SUMMARY',
        status: 'TIMEOUT',
        latencyMs: 10000,
      },
      {
        userId: buyer.id,
        featureType: 'DOCUMENT_SUMMARY',
        status: 'RATE_LIMITED',
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('Test accounts (password: password123):');
  console.log('  buyer@trustedplot.com (BUYER)');
  console.log('  seller@trustedplot.com (SELLER)');
  console.log('  mandate@trustedplot.com (MANDATE)');
  console.log('  legal@trustedplot.com (LEGAL_OPS)');
  console.log('  inspector@trustedplot.com (INSPECTOR)');
  console.log('  admin@trustedplot.com (ADMIN)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
