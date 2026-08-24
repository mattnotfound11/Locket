import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';
import { PageIntro } from '@/components/layout/PageIntro';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Basket, collection window, details and payment on one page.',
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageIntro
        title="Checkout"
        lede="Everything on one page. Pick your window, add your details, and choose how you want to pay."
      />
      <div className="pt-10">
        <CheckoutClient />
      </div>
    </>
  );
}
