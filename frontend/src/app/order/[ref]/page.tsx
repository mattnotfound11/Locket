import type { Metadata } from 'next';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';

export const metadata: Metadata = { title: 'Your order', robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <OrderConfirmation orderRef={ref} />;
}
