import { describe, it, expect } from 'vitest';
import { createListingSchema } from '@/lib/validators/listings';
import { createEscrowSchema, fundEscrowSchema, disputeEscrowSchema } from '@/lib/validators/escrows';
import { createInspectionSchema, inspectionReportSchema } from '@/lib/validators/inspections';

describe('Listing Validators', () => {
  it('accepts valid listing data', () => {
    const result = createListingSchema.safeParse({
      title: 'Modern 3BR Apartment',
      description: 'A beautiful apartment in the heart of Lekki Phase 1 with modern amenities.',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki Phase 1',
      price: 85000000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects listing with missing title', () => {
    const result = createListingSchema.safeParse({
      description: 'Some description text that is long enough.',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki',
      price: 50000000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects listing with invalid property type', () => {
    const result = createListingSchema.safeParse({
      title: 'Valid Title Here',
      description: 'Valid description text for the listing.',
      propertyType: 'CASTLE',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki',
      price: 50000000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects listing with negative price', () => {
    const result = createListingSchema.safeParse({
      title: 'Valid Title Here',
      description: 'Valid description text for the listing.',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki',
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects listing with short title', () => {
    const result = createListingSchema.safeParse({
      title: 'Hi',
      description: 'Valid description text for the listing.',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      city: 'Lagos',
      district: 'Lekki',
      price: 50000000,
    });
    expect(result.success).toBe(false);
  });
});

describe('Escrow Validators', () => {
  it('accepts valid escrow creation', () => {
    const result = createEscrowSchema.safeParse({
      listingId: 'clx123abc',
      amount: 85000000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects escrow with zero amount', () => {
    const result = createEscrowSchema.safeParse({
      listingId: 'clx123abc',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects escrow with decimal amount', () => {
    const result = createEscrowSchema.safeParse({
      listingId: 'clx123abc',
      amount: 50000.50,
    });
    expect(result.success).toBe(false);
  });

  it('accepts fund escrow with defaults', () => {
    const result = fundEscrowSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentMethod).toBe('TRANSFER');
    }
  });

  it('rejects dispute with short reason', () => {
    const result = disputeEscrowSchema.safeParse({ reason: 'bad' });
    expect(result.success).toBe(false);
  });

  it('accepts dispute with valid reason', () => {
    const result = disputeEscrowSchema.safeParse({
      reason: 'The seller has not provided the original documents as promised.',
    });
    expect(result.success).toBe(true);
  });
});

describe('Inspection Validators', () => {
  it('accepts valid inspection booking', () => {
    const result = createInspectionSchema.safeParse({
      listingId: 'clx123abc',
      slotAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects inspection with invalid datetime', () => {
    const result = createInspectionSchema.safeParse({
      listingId: 'clx123abc',
      slotAt: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('accepts report with valid summary', () => {
    const result = inspectionReportSchema.safeParse({
      summary: 'Property is in excellent condition with all structural elements intact.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects report with short summary', () => {
    const result = inspectionReportSchema.safeParse({
      summary: 'Looks good.',
    });
    expect(result.success).toBe(false);
  });
});
