import type { Metadata } from 'next';
import Link from 'next/link';
import { MenuBrowser } from '@/components/menu/MenuBrowser';
import { PageIntro } from '@/components/layout/PageIntro';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'The full Locket menu: cookies, cupcakes, cakes, tarts and chilled desserts. ' +
    'Every item lists its allergens, and sealed items carry full nutrition information.',
};

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="The menu"
        title="Everything we bake"
        lede="Prices are per piece unless the item says otherwise. Allergens are listed on every card, and anything sealed carries a full nutrition panel."
      >
        <Link href="/custom-orders" className="btn btn-outline h-12 px-6 text-sm">
          Need something custom?
        </Link>
      </PageIntro>

      <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <MenuBrowser />
      </div>
    </>
  );
}
