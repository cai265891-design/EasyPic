import { Hero } from '@/components/hero';
import { FeatureCards } from '@/components/feature-cards';
import { BeforeAfter } from '@/components/before-after';
import { MiniPricing } from '@/components/mini-pricing';

export default function IndexPage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <BeforeAfter />
      <MiniPricing />
    </>
  );
}
