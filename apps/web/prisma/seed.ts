import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Unsplash royalty-free property photos (sized for fast loading)
const IMG = (id: string) => `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

const PROPERTY_IMAGES = {
  // Modern apartments
  apartment1: ['photo-1545324418-cc1a3fa10c00', 'photo-1493809842364-78817add7ffb', 'photo-1502672260266-1c1ef2d93688', 'photo-1560448204-e02f11c3d0e2'],
  apartment2: ['photo-1522708323590-d24dbb6b0267', 'photo-1502672023488-70e25813eb80', 'photo-1560185007-cde436f6a4d0', 'photo-1556909114-f6e7ad7d3136'],
  apartment3: ['photo-1560448204-603b3fc33ddc', 'photo-1502005229762-cf1b2da7c5d6', 'photo-1554995207-c18c203602cb'],
  // Luxury houses & duplexes
  house1: ['photo-1613490493576-7fde63acd811', 'photo-1600596542815-ffad4c1539a9', 'photo-1600585154340-be6161a56a0c', 'photo-1600607687939-ce8a6c25118c'],
  house2: ['photo-1564013799919-ab600027ffc6', 'photo-1568605114967-8130f3a36994', 'photo-1583608205776-bfd35f0d9f83', 'photo-1600210492486-724fe5c67fb0'],
  house3: ['photo-1576941089067-2de3c901e126', 'photo-1605276374104-dee2a0ed3cd6', 'photo-1600573472550-8090b5e0745e'],
  house4: ['photo-1512917774080-9991f1c4c750', 'photo-1505691938895-1758d7feb511', 'photo-1493663284031-b7e3aefcae8e'],
  // Commercial
  commercial1: ['photo-1486406146926-c627a92ad1ab', 'photo-1497366216548-37526070297c', 'photo-1497366811353-6870744d04b2'],
  commercial2: ['photo-1577415124269-fc1140a69e91', 'photo-1497366754035-f200968a6e72', 'photo-1604328698692-f76ea9498e76'],
  // Land / aerial
  land1: ['photo-1500382017468-9049fed747ef', 'photo-1506905925346-21bda4d32df4', 'photo-1464822759023-fed622ff2c3b'],
  land2: ['photo-1542856391-010fb87dcfed', 'photo-1574270981993-30c44f56a2cf'],
  // Rentals
  rental1: ['photo-1502673530728-f79b4cab31b1', 'photo-1484154218962-a197022b5858', 'photo-1522444690501-1d6f6cc34c1f'],
  rental2: ['photo-1554995207-c18c203602cb', 'photo-1494203484021-3c454daf695d'],
};

async function main() {
  console.log('🌱 Seeding TrustedPlot database with rich demo data...');

  // ─── CLEAN: idempotent reset of demo data (preserves real users) ───
  console.log('  Cleaning existing demo data...');
  await prisma.aIUsageLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.escrowEvent.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.escrowCase.deleteMany({});
  await prisma.inspectionReport.deleteMany({});
  await prisma.inspectionBooking.deleteMany({});
  await prisma.verificationDecision.deleteMany({});
  await prisma.verificationCase.deleteMany({});
  await prisma.listingDocument.deleteMany({});
  await prisma.listingMedia.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.sellerProfile.deleteMany({});
  // keep users so existing logins survive

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── USERS ───
  console.log('  Creating users...');
  const users = await Promise.all([
    // Buyers
    prisma.user.upsert({ where: { email: 'buyer@trustedplot.com' }, update: { name: 'Adebayo Okonkwo' }, create: { email: 'buyer@trustedplot.com', name: 'Adebayo Okonkwo', passwordHash, role: 'BUYER', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'tunde@trustedplot.com' }, update: {}, create: { email: 'tunde@trustedplot.com', name: 'Tunde Bakare', passwordHash, role: 'BUYER', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'amaka@trustedplot.com' }, update: {}, create: { email: 'amaka@trustedplot.com', name: 'Amaka Eze', passwordHash, role: 'BUYER', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'kemi@trustedplot.com' }, update: {}, create: { email: 'kemi@trustedplot.com', name: 'Kemi Adesanya', passwordHash, role: 'BUYER', status: 'ACTIVE' } }),
    // Sellers
    prisma.user.upsert({ where: { email: 'seller@trustedplot.com' }, update: { name: 'Chinedu Obi' }, create: { email: 'seller@trustedplot.com', name: 'Chinedu Obi', passwordHash, role: 'SELLER', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'ifeoma@trustedplot.com' }, update: {}, create: { email: 'ifeoma@trustedplot.com', name: 'Ifeoma Nwosu', passwordHash, role: 'SELLER', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'mandate@trustedplot.com' }, update: { name: 'Fatima Aliyu' }, create: { email: 'mandate@trustedplot.com', name: 'Fatima Aliyu', passwordHash, role: 'MANDATE', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'highrise@trustedplot.com' }, update: {}, create: { email: 'highrise@trustedplot.com', name: 'Highrise Developments Ltd', passwordHash, role: 'MANDATE', status: 'ACTIVE' } }),
    // Inspectors
    prisma.user.upsert({ where: { email: 'inspector@trustedplot.com' }, update: { name: 'Emeka Ugwu' }, create: { email: 'inspector@trustedplot.com', name: 'Emeka Ugwu', passwordHash, role: 'INSPECTOR', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'sade@trustedplot.com' }, update: {}, create: { email: 'sade@trustedplot.com', name: 'Sade Williams', passwordHash, role: 'INSPECTOR', status: 'ACTIVE' } }),
    // Legal Ops
    prisma.user.upsert({ where: { email: 'legal@trustedplot.com' }, update: { name: 'Ngozi Eze' }, create: { email: 'legal@trustedplot.com', name: 'Ngozi Eze', passwordHash, role: 'LEGAL_OPS', status: 'ACTIVE' } }),
    prisma.user.upsert({ where: { email: 'barrister@trustedplot.com' }, update: {}, create: { email: 'barrister@trustedplot.com', name: 'Barrister Olu Adeyemi', passwordHash, role: 'LEGAL_OPS', status: 'ACTIVE' } }),
    // Admin
    prisma.user.upsert({ where: { email: 'admin@trustedplot.com' }, update: {}, create: { email: 'admin@trustedplot.com', name: 'Admin User', passwordHash, role: 'ADMIN', status: 'ACTIVE' } }),
  ]);

  const [buyer1, buyer2, buyer3, buyer4, seller1, seller2, mandate1, mandate2, inspector1, inspector2, legalOps1, legalOps2, admin] = users;

  // ─── SELLER PROFILES ───
  console.log('  Creating seller profiles...');
  const sp1 = await prisma.sellerProfile.create({ data: { userId: seller1.id, sellerType: 'INDIVIDUAL', displayName: 'Chinedu Obi Properties', kycStatus: 'VERIFIED', phone: '+234 803 555 0101', bio: 'Trusted property seller in Lagos with 8+ years of experience. C of O specialist.' } });
  const sp2 = await prisma.sellerProfile.create({ data: { userId: seller2.id, sellerType: 'LANDLORD', displayName: 'Ifeoma Nwosu Estates', kycStatus: 'VERIFIED', phone: '+234 805 555 0202', bio: 'Family-owned estate management. Premium properties in Abuja.' } });
  const sp3 = await prisma.sellerProfile.create({ data: { userId: mandate1.id, sellerType: 'MANDATE', displayName: 'Aliyu Mandate Services', kycStatus: 'VERIFIED', isMandate: true, phone: '+234 807 555 0303', companyName: 'Aliyu Property Mandates Ltd', bio: 'Authorized mandate for high-value Abuja properties.' } });
  const sp4 = await prisma.sellerProfile.create({ data: { userId: mandate2.id, sellerType: 'DEVELOPER', displayName: 'Highrise Developments', kycStatus: 'VERIFIED', isMandate: true, phone: '+234 809 555 0404', companyName: 'Highrise Developments Ltd', bio: 'Premium real estate developer. Lekki, Ikoyi, Banana Island.' } });

  // ─── LISTINGS WITH MEDIA ───
  console.log('  Creating listings, media, documents...');

  const makeListing = async (data: any, photos: string[], docs?: { type: any; status?: any }[]) => {
    const listing = await prisma.listing.create({ data });
    await prisma.listingMedia.createMany({
      data: photos.map((id, i) => ({ listingId: listing.id, mediaType: 'IMAGE' as const, url: IMG(id), altText: `${data.title} photo ${i + 1}`, position: i })),
    });
    if (docs) {
      for (const doc of docs) {
        await prisma.listingDocument.create({
          data: {
            listingId: listing.id,
            documentType: doc.type,
            storageKey: `documents/seed/${doc.type.toLowerCase()}-${listing.id}.pdf`,
            originalFilename: `${doc.type.toLowerCase().replace(/_/g, '-')}.pdf`,
            mimeType: 'application/pdf',
            fileSize: 1500000 + Math.floor(Math.random() * 1500000),
            uploadedByUserId: data.sellerProfileId === sp1.id ? seller1.id : data.sellerProfileId === sp2.id ? seller2.id : data.sellerProfileId === sp3.id ? mandate1.id : mandate2.id,
            status: doc.status || 'AVAILABLE',
          },
        });
      }
    }
    return listing;
  };

  // ── VERIFIED LISTINGS (gold standard, full document set) ──
  const l1 = await makeListing({
    sellerProfileId: sp1.id,
    title: '3 Bedroom Apartment in Lekki Phase 1',
    description: 'Beautifully finished 3 bedroom apartment in a secure estate in Lekki Phase 1. Features 24/7 power, swimming pool, gymnasium, covered parking, and concierge service. Walking distance to Circle Mall and beach.',
    propertyType: 'APARTMENT', listingType: 'SALE', city: 'Lagos', district: 'Lekki Phase 1', addressSummary: 'Block C, The Pearl Estate, Lekki Phase 1',
    price: BigInt(120_000_000), bedrooms: 3, bathrooms: 3, squareMeters: 165,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GOLD',
  }, PROPERTY_IMAGES.apartment1, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }, { type: 'DEED_OF_ASSIGNMENT' }, { type: 'GOVERNORS_CONSENT' }]);

  const l2 = await makeListing({
    sellerProfileId: sp2.id,
    title: 'Luxury 5 Bedroom Duplex in Maitama',
    description: 'Exquisite 5 bedroom fully detached duplex in the heart of Maitama. 800sqm of land, BQ, swimming pool, lush garden, and ample parking. Diplomatic-grade security in a prestigious neighborhood.',
    propertyType: 'HOUSE', listingType: 'SALE', city: 'Abuja', district: 'Maitama', addressSummary: 'Plot 24, Diplomatic Drive, Maitama',
    price: BigInt(450_000_000), bedrooms: 5, bathrooms: 6, squareMeters: 480,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GOLD',
  }, PROPERTY_IMAGES.house1, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }, { type: 'DEED_OF_ASSIGNMENT' }]);

  const l3 = await makeListing({
    sellerProfileId: sp4.id,
    title: '4 Bedroom Penthouse in Banana Island',
    description: 'Ultra-luxury 4 bedroom penthouse on Banana Island with panoramic ocean views. Smart home automation, private elevator, rooftop terrace with infinity pool. Concierge, valet, and 24/7 security.',
    propertyType: 'APARTMENT', listingType: 'SALE', city: 'Lagos', district: 'Banana Island', addressSummary: 'Tower 3, Banana Island Crescent',
    price: BigInt(950_000_000), bedrooms: 4, bathrooms: 5, squareMeters: 380,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GOLD',
  }, PROPERTY_IMAGES.house3, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }, { type: 'DEED_OF_ASSIGNMENT' }, { type: 'GOVERNORS_CONSENT' }]);

  const l4 = await makeListing({
    sellerProfileId: sp1.id,
    title: 'Modern 4 Bedroom Terrace in Ikoyi',
    description: 'Contemporary 4 bedroom terrace house with modern fittings and finishes. Private garage, fitted kitchen, study, and family lounge. Located in a serviced estate in Ikoyi.',
    propertyType: 'HOUSE', listingType: 'SALE', city: 'Lagos', district: 'Ikoyi', addressSummary: 'Plot 17, Bourdillon Road, Ikoyi',
    price: BigInt(280_000_000), bedrooms: 4, bathrooms: 4, squareMeters: 280,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GREEN',
  }, PROPERTY_IMAGES.house2, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }]);

  const l5 = await makeListing({
    sellerProfileId: sp2.id,
    title: '3 Bedroom Bungalow in Wuse 2',
    description: 'Cozy 3 bedroom bungalow in a quiet residential street. Mature garden, 2-car garage, and BQ. Recently renovated with modern fixtures.',
    propertyType: 'HOUSE', listingType: 'SALE', city: 'Abuja', district: 'Wuse 2', addressSummary: 'Plot 8, Aminu Kano Crescent, Wuse 2',
    price: BigInt(95_000_000), bedrooms: 3, bathrooms: 3, squareMeters: 220,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GREEN',
  }, PROPERTY_IMAGES.house4, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'DEED_OF_ASSIGNMENT' }]);

  const l6 = await makeListing({
    sellerProfileId: sp3.id,
    title: '2 Bedroom Apartment in Asokoro',
    description: 'Well-maintained 2 bedroom apartment in Asokoro, ideal for young professionals or small families. Close to Asokoro hospital, embassies, and shopping plazas.',
    propertyType: 'APARTMENT', listingType: 'SALE', city: 'Abuja', district: 'Asokoro', addressSummary: 'Suite 4B, Yakubu Gowon Crescent, Asokoro',
    price: BigInt(75_000_000), bedrooms: 2, bathrooms: 2, squareMeters: 110,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GREEN',
  }, PROPERTY_IMAGES.apartment2, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }]);

  // ── CONDITIONAL LISTINGS (verified with caveats) ──
  const l7 = await makeListing({
    sellerProfileId: sp4.id,
    title: 'Joint Venture: Mixed-Use Plot in Victoria Island',
    description: 'Prime 2,000sqm plot for joint venture development. C of O perfect, located on a major commercial axis. Ideal for office complex or mixed-use development. Equity partner sought.',
    propertyType: 'LAND', listingType: 'JV', city: 'Lagos', district: 'Victoria Island', addressSummary: 'Plot 2A, Adeola Odeku Street, VI',
    price: BigInt(800_000_000), squareMeters: 2000,
    status: 'CONDITIONAL', visibility: 'PUBLIC', badge: 'CONDITIONAL',
  }, PROPERTY_IMAGES.land1, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }]);

  const l8 = await makeListing({
    sellerProfileId: sp1.id,
    title: '1500sqm Land in Sangotedo',
    description: 'Buildable land in fast-growing Sangotedo area. Survey plan available. Right of Occupancy in process — buyer should verify state-level documentation before purchase.',
    propertyType: 'LAND', listingType: 'SALE', city: 'Lagos', district: 'Sangotedo', addressSummary: 'Plot 142, Greenfield Estate, Sangotedo',
    price: BigInt(45_000_000), squareMeters: 1500,
    status: 'CONDITIONAL', visibility: 'PUBLIC', badge: 'CONDITIONAL',
  }, PROPERTY_IMAGES.land2, [{ type: 'SURVEY_PLAN' }, { type: 'LAND_RECEIPT' }]);

  // ── RENTAL LISTINGS ──
  const l9 = await makeListing({
    sellerProfileId: sp2.id,
    title: '2 Bedroom Flat for Rent in Wuse 2',
    description: 'Newly renovated 2 bedroom flat with modern fittings. 24/7 power, water, and security. Available immediately for 1 year lease.',
    propertyType: 'APARTMENT', listingType: 'RENT', city: 'Abuja', district: 'Wuse 2', addressSummary: 'Flat 3, Aminu Kano Crescent, Wuse 2',
    price: BigInt(3_500_000), bedrooms: 2, bathrooms: 2, squareMeters: 95,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GREEN',
  }, PROPERTY_IMAGES.rental1, [{ type: 'OWNER_CONSENT' }, { type: 'CERTIFICATE_OF_OCCUPANCY' }]);

  const l10 = await makeListing({
    sellerProfileId: sp1.id,
    title: 'Studio Apartment for Rent in Yaba',
    description: 'Compact studio apartment in tech-hub Yaba. Perfect for young professionals. Walking distance to Co-Creation Hub, restaurants, and University of Lagos.',
    propertyType: 'APARTMENT', listingType: 'RENT', city: 'Lagos', district: 'Yaba', addressSummary: 'Unit 12, Herbert Macaulay Way, Yaba',
    price: BigInt(2_200_000), bedrooms: 1, bathrooms: 1, squareMeters: 45,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GREEN',
  }, PROPERTY_IMAGES.rental2, [{ type: 'OWNER_CONSENT' }]);

  // ── COMMERCIAL ──
  const l11 = await makeListing({
    sellerProfileId: sp4.id,
    title: 'Office Complex in Wuye',
    description: '6-floor office complex in Wuye business district. 2,400sqm of leasable space, central A/C, dedicated parking. Currently 40% leased — perfect for investor.',
    propertyType: 'COMMERCIAL', listingType: 'SALE', city: 'Abuja', district: 'Wuye', addressSummary: 'Plot 1, Aminu Kano Crescent extension, Wuye',
    price: BigInt(1_200_000_000), squareMeters: 2400,
    status: 'VERIFIED', visibility: 'PUBLIC', badge: 'VERIFIED_GOLD',
  }, PROPERTY_IMAGES.commercial1, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }, { type: 'GOVERNORS_CONSENT' }]);

  // ── DRAFT (only seller can see) ──
  const l12 = await makeListing({
    sellerProfileId: sp1.id,
    title: 'Commercial Land in Victoria Island',
    description: 'Prime commercial land measuring 2000sqm. Documentation in preparation for verification submission.',
    propertyType: 'LAND', listingType: 'SALE', city: 'Lagos', district: 'Victoria Island',
    price: BigInt(800_000_000), squareMeters: 2000,
    status: 'DRAFT', visibility: 'PRIVATE', badge: 'NONE',
  }, PROPERTY_IMAGES.commercial2, [{ type: 'SURVEY_PLAN', status: 'UPLOADED' }]);

  // ── SUBMITTED (under review) ──
  const l13 = await makeListing({
    sellerProfileId: sp2.id,
    title: '3 Bedroom Semi-Detached in Gwarinpa',
    description: 'Family-friendly semi-detached duplex in Gwarinpa. Spacious bedrooms, open-plan kitchen, and private courtyard. Recently submitted for verification.',
    propertyType: 'HOUSE', listingType: 'SALE', city: 'Abuja', district: 'Gwarinpa', addressSummary: '3rd Avenue, Gwarinpa Estate',
    price: BigInt(85_000_000), bedrooms: 3, bathrooms: 3, squareMeters: 200,
    status: 'SUBMITTED', visibility: 'PRIVATE', badge: 'NONE',
  }, PROPERTY_IMAGES.apartment3, [{ type: 'CERTIFICATE_OF_OCCUPANCY' }, { type: 'SURVEY_PLAN' }]);

  // ── REJECTED ──
  const l14 = await makeListing({
    sellerProfileId: sp1.id,
    title: 'Plot of Land in Magodo',
    description: 'Land in Magodo Phase 2. Documentation issues identified during verification — title disputed.',
    propertyType: 'LAND', listingType: 'SALE', city: 'Lagos', district: 'Magodo',
    price: BigInt(35_000_000), squareMeters: 600,
    status: 'REJECTED', visibility: 'PRIVATE', badge: 'NONE',
  }, PROPERTY_IMAGES.land1, [{ type: 'LAND_RECEIPT' }]);

  // ─── VERIFICATION CASES & DECISIONS ───
  console.log('  Creating verification cases...');
  const verifiedListings = [
    { listing: l1, decision: 'APPROVED', badge: 'VERIFIED_GOLD', seller: seller1, reviewer: legalOps1, reason: 'All documents verified. C of O, survey plan, and deed of assignment are valid and consistent. Title is clean.' },
    { listing: l2, decision: 'APPROVED', badge: 'VERIFIED_GOLD', seller: seller2, reviewer: legalOps1, reason: 'Premium property with full documentation chain. Survey plan matches Land Registry records.' },
    { listing: l3, decision: 'APPROVED', badge: 'VERIFIED_GOLD', seller: mandate2, reviewer: legalOps2, reason: 'High-value property fully verified. Developer is a registered corporate entity with clean track record.' },
    { listing: l4, decision: 'APPROVED', badge: 'VERIFIED_GREEN', seller: seller1, reviewer: legalOps1, reason: 'Documentation in order. Title verified.' },
    { listing: l5, decision: 'APPROVED', badge: 'VERIFIED_GREEN', seller: seller2, reviewer: legalOps2, reason: 'Standard residential property. Documentation complete.' },
    { listing: l6, decision: 'APPROVED', badge: 'VERIFIED_GREEN', seller: mandate1, reviewer: legalOps1, reason: 'Verified residential apartment. C of O and survey plan match.' },
    { listing: l7, decision: 'CONDITIONAL', badge: 'CONDITIONAL', seller: mandate2, reviewer: legalOps2, reason: 'C of O verified. JV-specific terms require additional legal agreements before transaction. Buyer to engage own counsel.' },
    { listing: l8, decision: 'CONDITIONAL', badge: 'CONDITIONAL', seller: seller1, reviewer: legalOps1, reason: 'Survey plan valid but R of O not yet finalized at state level. Recommended: complete state documentation before fund release.' },
    { listing: l9, decision: 'APPROVED', badge: 'VERIFIED_GREEN', seller: seller2, reviewer: legalOps1, reason: 'Rental property with valid owner consent. Lease terms standard.' },
    { listing: l10, decision: 'APPROVED', badge: 'VERIFIED_GREEN', seller: seller1, reviewer: legalOps2, reason: 'Standard rental verification complete.' },
    { listing: l11, decision: 'APPROVED', badge: 'VERIFIED_GOLD', seller: mandate2, reviewer: legalOps1, reason: 'Commercial property fully verified. Title and zoning compliant.' },
  ];

  for (const v of verifiedListings) {
    const vCase = await prisma.verificationCase.create({
      data: { listingId: v.listing.id, submittedByUserId: v.seller.id, assignedToUserId: v.reviewer.id, status: v.decision === 'CONDITIONAL' ? 'CONDITIONAL' : 'APPROVED', slaStartedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), slaDueAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    });
    await prisma.verificationDecision.create({
      data: { verificationCaseId: vCase.id, reviewerUserId: v.reviewer.id, decision: v.decision as any, badgeType: v.badge as any, reason: v.reason },
    });
  }

  // Pending verification (l13)
  await prisma.verificationCase.create({ data: { listingId: l13.id, submittedByUserId: seller2.id, status: 'PENDING', slaStartedAt: new Date(Date.now() - 12 * 3600 * 1000), slaDueAt: new Date(Date.now() + 36 * 3600 * 1000) } });

  // In-review verification
  await prisma.verificationCase.create({ data: { listingId: l13.id, submittedByUserId: seller2.id, assignedToUserId: legalOps1.id, status: 'IN_REVIEW', slaStartedAt: new Date(Date.now() - 24 * 3600 * 1000), slaDueAt: new Date(Date.now() + 24 * 3600 * 1000), notes: 'Reviewing C of O against Land Registry records.' } });

  // Rejected verification (l14)
  const vRej = await prisma.verificationCase.create({ data: { listingId: l14.id, submittedByUserId: seller1.id, assignedToUserId: legalOps1.id, status: 'REJECTED', slaStartedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000), slaDueAt: new Date(Date.now() - 6 * 24 * 3600 * 1000) } });
  await prisma.verificationDecision.create({ data: { verificationCaseId: vRej.id, reviewerUserId: legalOps1.id, decision: 'REJECTED', badgeType: 'NONE', reason: 'Title disputed — Land Registry shows two competing claims. Resolve title dispute before re-submitting.' } });

  // ─── INSPECTIONS ───
  console.log('  Creating inspections...');
  const inspectionsData = [
    // Completed with report
    { listing: l1, buyer: buyer1, inspector: inspector1, slot: -2, status: 'COMPLETED', withReport: true, summary: 'Property in excellent condition. All amenities verified. Recommend proceeding to escrow.' },
    { listing: l2, buyer: buyer2, inspector: inspector1, slot: -5, status: 'COMPLETED', withReport: true, summary: 'Premium property as advertised. Minor wear in the kitchen area noted; otherwise pristine condition.' },
    { listing: l4, buyer: buyer3, inspector: inspector2, slot: -1, status: 'COMPLETED', withReport: true, summary: 'Property matches listing description. Recent renovations confirmed. Recommended for purchase.' },
    // Confirmed (upcoming)
    { listing: l3, buyer: buyer2, inspector: inspector1, slot: 2, status: 'CONFIRMED' },
    { listing: l5, buyer: buyer4, inspector: inspector2, slot: 4, status: 'CONFIRMED' },
    // Requested (waiting assignment)
    { listing: l6, buyer: buyer1, inspector: null, slot: 5, status: 'REQUESTED' },
    { listing: l11, buyer: buyer3, inspector: null, slot: 6, status: 'REQUESTED' },
    // Cancelled
    { listing: l9, buyer: buyer4, inspector: inspector2, slot: -3, status: 'CANCELLED' },
  ];

  for (const i of inspectionsData) {
    const inspection = await prisma.inspectionBooking.create({
      data: {
        listingId: i.listing.id, buyerUserId: i.buyer.id, inspectorUserId: i.inspector?.id ?? null,
        slotAt: new Date(Date.now() + i.slot * 24 * 3600 * 1000), status: i.status as any,
        notes: i.status === 'CANCELLED' ? 'Buyer cancelled — schedule conflict.' : null,
      },
    });
    if (i.withReport && i.inspector) {
      await prisma.inspectionReport.create({
        data: {
          inspectionBookingId: inspection.id, submittedByInspectorUserId: i.inspector.id,
          summary: i.summary!,
          notes: 'Detailed report attached. Photos uploaded to secure document store.',
          reportData: { condition: 'good', recommendation: 'proceed', photos_count: 12 },
        },
      });
    }
  }

  // ─── ESCROWS ───
  console.log('  Creating escrows...');
  // FUNDED (active transaction)
  const e1 = await prisma.escrowCase.create({ data: { listingId: l1.id, buyerUserId: buyer1.id, sellerUserId: seller1.id, amount: BigInt(120_000_000), status: 'FUNDED', currency: 'NGN' } });
  await prisma.escrowEvent.createMany({ data: [
    { escrowCaseId: e1.id, eventType: 'CREATED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
    { escrowCaseId: e1.id, eventType: 'FUND_ATTEMPTED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
    { escrowCaseId: e1.id, eventType: 'FUNDED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), payload: { amount: '120000000', method: 'bank_transfer' } },
  ] });

  // CREATED (just initiated)
  const e2 = await prisma.escrowCase.create({ data: { listingId: l4.id, buyerUserId: buyer3.id, sellerUserId: seller1.id, amount: BigInt(280_000_000), status: 'CREATED' } });
  await prisma.escrowEvent.create({ data: { escrowCaseId: e2.id, eventType: 'CREATED', createdByUserId: buyer3.id } });

  // RELEASED (completed)
  const e3 = await prisma.escrowCase.create({ data: { listingId: l5.id, buyerUserId: buyer2.id, sellerUserId: seller2.id, amount: BigInt(95_000_000), status: 'RELEASED' } });
  await prisma.escrowEvent.createMany({ data: [
    { escrowCaseId: e3.id, eventType: 'CREATED', createdByUserId: buyer2.id, createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
    { escrowCaseId: e3.id, eventType: 'FUNDED', createdByUserId: buyer2.id, createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000) },
    { escrowCaseId: e3.id, eventType: 'RELEASE_REQUESTED', createdByUserId: buyer2.id, createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000) },
    { escrowCaseId: e3.id, eventType: 'RELEASED', createdByUserId: admin.id, createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000), payload: { released_to: 'seller', amount: '95000000' } },
  ] });

  // DISPUTED (with active dispute)
  const e4 = await prisma.escrowCase.create({ data: { listingId: l6.id, buyerUserId: buyer4.id, sellerUserId: mandate1.id, amount: BigInt(75_000_000), status: 'DISPUTED' } });
  await prisma.escrowEvent.createMany({ data: [
    { escrowCaseId: e4.id, eventType: 'CREATED', createdByUserId: buyer4.id, createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000) },
    { escrowCaseId: e4.id, eventType: 'FUNDED', createdByUserId: buyer4.id, createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000) },
    { escrowCaseId: e4.id, eventType: 'DISPUTE_OPENED', createdByUserId: buyer4.id, createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
  ] });
  await prisma.dispute.create({ data: { escrowCaseId: e4.id, openedByUserId: buyer4.id, reason: 'Property condition does not match listing description. Multiple defects observed during inspection that were not disclosed.', status: 'OPEN' } });

  // REFUNDED (resolved dispute)
  const e5 = await prisma.escrowCase.create({ data: { listingId: l9.id, buyerUserId: buyer1.id, sellerUserId: seller2.id, amount: BigInt(3_500_000), status: 'REFUNDED' } });
  await prisma.escrowEvent.createMany({ data: [
    { escrowCaseId: e5.id, eventType: 'CREATED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000) },
    { escrowCaseId: e5.id, eventType: 'FUNDED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000) },
    { escrowCaseId: e5.id, eventType: 'DISPUTE_OPENED', createdByUserId: buyer1.id, createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000) },
    { escrowCaseId: e5.id, eventType: 'REFUND_REQUESTED', createdByUserId: admin.id, createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) },
    { escrowCaseId: e5.id, eventType: 'REFUNDED', createdByUserId: admin.id, createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000), payload: { refunded_to: 'buyer', amount: '3500000' } },
  ] });
  await prisma.dispute.create({ data: { escrowCaseId: e5.id, openedByUserId: buyer1.id, reason: 'Landlord refused to honor lease agreement after funding.', status: 'RESOLVED', resolutionSummary: 'Refund issued to buyer after seller failed to respond within SLA.' } });

  // ─── AUDIT LOGS ───
  console.log('  Creating audit logs...');
  const auditEntries = [
    { actor: seller1.id, action: 'LISTING_CREATED', entity: 'Listing', id: l1.id, daysAgo: 30 },
    { actor: seller1.id, action: 'DOCUMENT_UPLOADED', entity: 'ListingDocument', id: l1.id, daysAgo: 30, meta: { type: 'CERTIFICATE_OF_OCCUPANCY' } },
    { actor: seller1.id, action: 'VERIFICATION_SUBMITTED', entity: 'VerificationCase', id: l1.id, daysAgo: 30 },
    { actor: legalOps1.id, action: 'VERIFICATION_DECISION', entity: 'VerificationCase', id: l1.id, daysAgo: 28, meta: { decision: 'APPROVED', badge: 'VERIFIED_GOLD' } },
    { actor: seller2.id, action: 'LISTING_CREATED', entity: 'Listing', id: l2.id, daysAgo: 25 },
    { actor: legalOps1.id, action: 'VERIFICATION_DECISION', entity: 'VerificationCase', id: l2.id, daysAgo: 23, meta: { decision: 'APPROVED', badge: 'VERIFIED_GOLD' } },
    { actor: mandate2.id, action: 'LISTING_CREATED', entity: 'Listing', id: l3.id, daysAgo: 20 },
    { actor: legalOps2.id, action: 'VERIFICATION_DECISION', entity: 'VerificationCase', id: l3.id, daysAgo: 18, meta: { decision: 'APPROVED', badge: 'VERIFIED_GOLD' } },
    { actor: buyer1.id, action: 'INSPECTION_BOOKED', entity: 'InspectionBooking', id: l1.id, daysAgo: 14 },
    { actor: buyer1.id, action: 'ESCROW_CREATED', entity: 'EscrowCase', id: e1.id, daysAgo: 7 },
    { actor: buyer1.id, action: 'ESCROW_FUNDED', entity: 'EscrowCase', id: e1.id, daysAgo: 5, meta: { amount: '120000000' } },
    { actor: inspector1.id, action: 'INSPECTION_REPORT_SUBMITTED', entity: 'InspectionBooking', id: l1.id, daysAgo: 4 },
    { actor: buyer4.id, action: 'DISPUTE_OPENED', entity: 'EscrowCase', id: e4.id, daysAgo: 3 },
    { actor: buyer2.id, action: 'ESCROW_RELEASED', entity: 'EscrowCase', id: e3.id, daysAgo: 12 },
    { actor: legalOps1.id, action: 'VERIFICATION_DECISION', entity: 'VerificationCase', id: l14.id, daysAgo: 6, meta: { decision: 'REJECTED' } },
    { actor: buyer3.id, action: 'INSPECTION_BOOKED', entity: 'InspectionBooking', id: l4.id, daysAgo: 2 },
    { actor: buyer2.id, action: 'INSPECTION_BOOKED', entity: 'InspectionBooking', id: l3.id, daysAgo: 1 },
    { actor: seller2.id, action: 'LISTING_CREATED', entity: 'Listing', id: l13.id, daysAgo: 1 },
    { actor: seller2.id, action: 'VERIFICATION_SUBMITTED', entity: 'VerificationCase', id: l13.id, daysAgo: 1 },
    { actor: admin.id, action: 'USER_REGISTERED', entity: 'User', id: buyer4.id, daysAgo: 5 },
  ];
  await prisma.auditLog.createMany({
    data: auditEntries.map(a => ({ actorUserId: a.actor, actionType: a.action, entityType: a.entity, entityId: a.id, metadata: a.meta as any, createdAt: new Date(Date.now() - a.daysAgo * 24 * 3600 * 1000) })),
  });

  // ─── AI USAGE ───
  await prisma.aIUsageLog.createMany({
    data: [
      { userId: buyer1.id, featureType: 'DOCUMENT_SUMMARY', status: 'SUCCESS', latencyMs: 2340, tokenUsage: 450 },
      { userId: buyer2.id, featureType: 'DOCUMENT_SUMMARY', status: 'SUCCESS', latencyMs: 1890, tokenUsage: 380 },
      { userId: legalOps1.id, featureType: 'INTERNAL_VERIFICATION_SUMMARY', status: 'SUCCESS', latencyMs: 3120, tokenUsage: 620 },
      { userId: buyer3.id, featureType: 'DOCUMENT_SUMMARY', status: 'TIMEOUT', latencyMs: 10000 },
      { userId: buyer1.id, featureType: 'DOCUMENT_SUMMARY', status: 'RATE_LIMITED' },
    ],
  });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   ${users.length} users (across all roles)`);
  console.log(`   4 seller profiles`);
  console.log(`   14 listings (11 verified/conditional, 1 draft, 1 submitted, 1 rejected)`);
  console.log(`   13 verification cases`);
  console.log(`   8 inspections (3 with reports)`);
  console.log(`   5 escrows (CREATED, FUNDED, RELEASED, DISPUTED, REFUNDED)`);
  console.log(`   2 disputes (1 active, 1 resolved)`);
  console.log(`   ${auditEntries.length} audit log entries`);
  console.log('\n🔑 Test accounts (password: password123):');
  console.log('   buyer@trustedplot.com    (BUYER)');
  console.log('   seller@trustedplot.com   (SELLER)');
  console.log('   mandate@trustedplot.com  (MANDATE)');
  console.log('   inspector@trustedplot.com (INSPECTOR)');
  console.log('   legal@trustedplot.com    (LEGAL_OPS)');
  console.log('   admin@trustedplot.com    (ADMIN)\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
