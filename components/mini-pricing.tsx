import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '永久免费',
    credits: '50 积分',
    features: ['5 个项目/月', '所有图片类型', '基础文案生成', '邮件支持'],
    cta: '免费开始',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '每月',
    credits: '300 积分',
    features: [
      '30 个项目/月',
      '所有图片类型',
      '高级文案生成',
      '优先支持',
      '自定义风格',
    ],
    cta: '立即开始',
    href: '/pricing',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$99',
    period: '每月',
    credits: '1200 积分',
    features: [
      '120 个项目/月',
      '所有功能',
      'API 访问',
      '专属支持',
      '团队协作',
    ],
    cta: '联系销售',
    href: '/pricing',
  },
];

export function MiniPricing() {
  return (
    <section className="border-t py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">简单透明的定价</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            选择适合您的套餐。没有隐藏费用。
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
                    最受欢迎
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
                <Link href={plan.href} className="w-full">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
