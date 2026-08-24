import { Hero } from '@/components/home/Hero';
import { Promises } from '@/components/home/Promises';
import { Ticker } from '@/components/home/Ticker';
import { Bestsellers } from '@/components/home/Bestsellers';
import { StoryPreview } from '@/components/home/StoryPreview';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CustomCta } from '@/components/home/CustomCta';
import { Newsletter } from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Promises />
      <Ticker />
      <Bestsellers />
      <StoryPreview />
      <HowItWorks />
      <CustomCta />
      <Newsletter />
    </>
  );
}
