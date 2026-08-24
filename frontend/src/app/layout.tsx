import type { Metadata, Viewport } from 'next';
import { Baloo_2, Nunito, Caveat } from 'next/font/google';
import { STORE, MAP_LINK } from '@/config/store';
import { CartProvider } from '@/lib/cart';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollElevation } from '@/components/motion/ScrollElevation';
import './globals.css';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-baloo', display: 'swap' });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['700'], variable: '--font-caveat', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://locket-bakes.vercel.app'),
  title: {
    default: `${STORE.name} | ${STORE.descriptor} in ${STORE.address.city}`,
    template: `%s | ${STORE.name}`,
  },
  description:
    `${STORE.tagline}. Cookies, cupcakes, cakes and custom bakes from ${STORE.address.city}. ` +
    'Order online for pickup or delivery with a time slot that suits you.',
  keywords: ['bakery', 'cookies', 'custom cake', STORE.address.city, 'Iloilo', 'Panay', 'pastry'],
  openGraph: {
    title: `${STORE.name} | ${STORE.descriptor}`,
    description: `${STORE.tagline}. Order online for pickup or delivery.`,
    type: 'website',
    locale: 'en_PH',
  },
  icons: { icon: '/brand/locket-badge.png', apple: '/brand/locket-badge.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdeef0' },
    { media: '(prefers-color-scheme: dark)', color: '#241a1e' },
  ],
};

/** Rich result for the shop, so the address and hours can surface in search. */
const BAKERY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: STORE.legalName,
  description: STORE.tagline,
  telephone: STORE.phone,
  email: STORE.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${STORE.address.line1}, ${STORE.address.line2}`,
    addressLocality: STORE.address.city,
    addressRegion: STORE.address.region,
    postalCode: STORE.address.postcode,
    addressCountry: 'PH',
  },
  hasMap: MAP_LINK,
  priceRange: '₱₱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH" className={`${baloo.variable} ${nunito.variable} ${caveat.variable}`}>
      <head>
        {/*
          Marks the document before first paint so reveal elements start hidden
          without a flash. If scripting is off the class never lands and every
          element renders visible, which is the safe direction to fail.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('motion-ready')",
          }}
        />
      </head>
      <body id="top">
        <div id="scroll-sentinel" aria-hidden />
        <ScrollElevation />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(BAKERY_SCHEMA) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-5 focus:py-3 focus:font-bold"
          style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
        >
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
