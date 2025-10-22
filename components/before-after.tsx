import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function BeforeAfter() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">See the Transformation</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            From a single photo to 5 professional Amazon images
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:gap-12">
          {/* Before */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
                Before
              </span>
            </div>
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image
                  src="/examples/before.jpg"
                  alt="Before"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  Original product photo
                </p>
              </div>
            </Card>
          </div>

          {/* Arrow */}
          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight className="h-12 w-12 text-muted-foreground" />
          </div>

          {/* After */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                After
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Main', 'Lifestyle', 'Detail', 'Dimension', 'Feature'].slice(0, 4).map((type, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="relative aspect-square bg-white">
                    <Image
                      src="/examples/after.jpg"
                      alt={type}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-center text-xs text-muted-foreground">{type}</p>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              + SEO-optimized copy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
