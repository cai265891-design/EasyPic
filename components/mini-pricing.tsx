import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    credits: '50 credits',
    features: ['5 projects/month', 'All image types', 'Basic copy generation', 'Email support'],
    cta: 'Start Free',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    credits: '300 credits',
    features: [
      '30 projects/month',
      'All image types',
      'Advanced copy generation',
      'Priority support',
      'Custom styles',
    ],
    cta: 'Get Started',
    href: '/pricing',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: 'per month',
    credits: '1200 credits',
    features: [
      '120 projects/month',
      'All features',
      'API access',
      'Dedicated support',
      'Team collaboration',
    ],
    cta: 'Contact Sales',
    href: '/pricing',
  },
];

export function MiniPricing() {
  return (
    <section className="border-t py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={plan.popular ? 'relative border-2 border-primary shadow-lg' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-primary">{plan.credits}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
