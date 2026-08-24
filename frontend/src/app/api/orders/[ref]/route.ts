import { NextResponse } from 'next/server';
import { getOrderRepository } from '@/infrastructure/repositories/orders';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params;
  const order = await getOrderRepository().find(ref);
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  return NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } });
}
