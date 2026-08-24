import type { Metadata } from 'next';
import { CustomOrderForm } from '@/components/checkout/CustomOrderForm';
import { PageIntro } from '@/components/layout/PageIntro';
import { CUSTOM_ORDER_LEAD_DAYS, CUSTOM_ORDER_LEAD_DAYS_TIERED } from '@/domain/fulfillment/leadtime';

export const metadata: Metadata = {
  title: 'Custom cakes',
  description:
    'Brief a custom cake: occasion, date, servings, flavours, a reference photo and any dietary needs. ' +
    'Quoted within one working day.',
};

export default function CustomOrdersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Custom orders"
        title="Tell us what you are picturing"
        lede={`Most cakes need ${CUSTOM_ORDER_LEAD_DAYS} days of notice, and the big ones ${CUSTOM_ORDER_LEAD_DAYS_TIERED}. Fill this in and we will come back with a price and a sketch within one working day.`}
      />
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6 lg:py-16">
        <CustomOrderForm />
      </div>
    </>
  );
}
