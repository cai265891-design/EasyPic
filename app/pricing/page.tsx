import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    credits: '50 credits/month',
    features: [
      '5 projects per month',
      'All 5 image types',
      'Basic copywriting',
      'Email support',
      'Amazon compliance check',
    ],
    cta: 'Start Free',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    credits: '300 credits/month',
    features: [
      '30 projects per month',
      'All 5 image types',
      'Advanced copywriting with SEO',
      'Priority support',
      'Custom styles & templates',
      'Batch processing',
    ],
    cta: 'Get Started',
    href: '/dashboard',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: 'per month',
    credits: '1200 credits/month',
    features: [
      '120 projects per month',
      'Everything in Pro',
      'API access',
      'Dedicated account manager',
      'Team collaboration (5 seats)',
      'Custom branding',
      'Priority processing',
    ],
    cta: 'Contact Sales',
    href: '/dashboard',
  },
];

const faqs = [
  {
    q: 'What are credits?',
    a: 'Each project (5 images + copy) costs 10 credits. You can purchase additional credits anytime.',
  },
  {
    q: 'Can I change plans anytime?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Yes, unused credits roll over to the next month for paid plans. Free plan credits reset monthly.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe.',
  },
];

export default function PricingPage() {
  return (
    <div className="container max-w-7xl space-y-16 px-6 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your needs. Start free, upgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
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
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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

      {/* Additional Credits */}
      <div className="mx-auto max-w-4xl rounded-2xl border bg-muted/30 p-8 text-center">
        <h3 className="mb-3 text-2xl font-bold">Need More Credits?</h3>
        <p className="mb-6 text-muted-foreground">
          Purchase additional credit packs anytime, no subscription required
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="rounded-lg border bg-background p-4">
            <p className="text-2xl font-bold">100 Credits</p>
            <p className="text-muted-foreground">$15</p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="text-2xl font-bold">500 Credits</p>
            <p className="text-sm text-green-600">20% OFF</p>
            <p className="text-muted-foreground">$60</p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="text-2xl font-bold">2000 Credits</p>
            <p className="text-sm text-green-600">33% OFF</p>
            <p className="text-muted-foreground">$200</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg border p-6">
              <h4 className="mb-2 font-semibold">{faq.q}</h4>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
