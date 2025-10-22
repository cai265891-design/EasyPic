import { Card, CardContent } from '@/components/ui/card';
import { Image, FileText, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Image,
    title: '5 Professional Images',
    description:
      'Auto-generate white background, lifestyle, detail, dimension, and feature images that meet Amazon standards.',
  },
  {
    icon: FileText,
    title: 'SEO-Optimized Copy',
    description:
      'AI-powered title, 5-point bullet list, and product description optimized for Amazon search and conversion.',
  },
  {
    icon: CheckCircle,
    title: 'Amazon Compliant',
    description:
      'Automatic compliance checking for background color, resolution, watermarks, and product占 ratio.',
  },
];

export function FeatureCards() {
  return (
    <section className="border-t bg-muted/30 py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Why Choose Our Generator?</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Everything you need to create professional Amazon listings in one place
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden border-2">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
