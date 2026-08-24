import { NextResponse } from 'next/server';
import {
  validateCustomOrder, MAX_REFERENCE_BYTES, ACCEPTED_IMAGE_TYPES, CUSTOM_DEPOSIT,
  type CustomOrderRequest, type ReferenceImage, type Occasion, type Flavour,
} from '@/domain/orders/custom';
import { customLeadDaysFor } from '@/domain/fulfillment/leadtime';
import { generateOrderRef } from '@/domain/orders/order';
import { getOrderRepository } from '@/infrastructure/repositories/orders';
import type { Allergen, DietaryTag } from '@/domain/catalog/types';

export const dynamic = 'force-dynamic';

/**
 * Accepts multipart so the design reference photo arrives with the brief.
 *
 * With BLOB_READ_WRITE_TOKEN set the image goes to Vercel Blob and we keep the
 * URL. Without it, the image is inlined as a data URL so the flow still works
 * end to end on a bare deploy; that path is capped hard on size.
 */
async function storeReference(file: File): Promise<ReferenceImage | { error: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Reference photos must be JPG, PNG, WEBP or HEIC.' };
  }
  if (file.size > MAX_REFERENCE_BYTES) {
    return { error: 'That photo is over 5 MB. Please send a smaller one.' };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`custom-orders/${Date.now()}-${file.name}`, buffer, {
        access: 'public', contentType: file.type,
      });
      return { filename: file.name, contentType: file.type, bytes: file.size, url: blob.url };
    } catch {
      // Fall through to the inline path rather than losing the customer's brief.
    }
  }

  return {
    filename: file.name,
    contentType: file.type,
    bytes: file.size,
    url: `data:${file.type};base64,${buffer.toString('base64')}`,
  };
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Malformed submission.' }, { status: 400 });
  }

  const str = (k: string) => String(form.get(k) ?? '').trim();
  const list = (k: string) => form.getAll(k).map(String).filter(Boolean);

  const input = {
    occasion: str('occasion'),
    eventDate: str('eventDate'),
    servings: Number(str('servings')),
    flavours: list('flavours'),
    dietary: list('dietary'),
    avoidAllergens: list('avoidAllergens'),
    designNotes: str('designNotes'),
    name: str('name'),
    email: str('email'),
    phone: str('phone'),
    budget: str('budget') ? Number(str('budget')) * 100 : undefined,
  };

  const errors = validateCustomOrder(input, new Date());

  let reference: ReferenceImage | undefined;
  const file = form.get('reference');
  if (file instanceof File && file.size > 0) {
    const stored = await storeReference(file);
    if ('error' in stored) errors.reference = stored.error;
    else reference = stored;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const leadDays = customLeadDaysFor(input.servings);
  const req: CustomOrderRequest = {
    ref: generateOrderRef(),
    submittedAt: new Date().toISOString(),
    occasion: input.occasion as Occasion,
    eventDate: input.eventDate,
    servings: input.servings,
    flavours: input.flavours as Flavour[],
    dietary: input.dietary as DietaryTag[],
    avoidAllergens: input.avoidAllergens as Allergen[],
    designNotes: input.designNotes,
    reference,
    budget: input.budget,
    customer: { name: input.name, email: input.email, phone: input.phone },
    leadDays,
    depositDue: CUSTOM_DEPOSIT,
    status: 'received',
  };

  await getOrderRepository().saveCustomRequest(req);

  return NextResponse.json({
    ref: req.ref,
    leadDays,
    depositDue: CUSTOM_DEPOSIT,
    hasReference: Boolean(reference),
  });
}
