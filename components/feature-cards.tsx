import { Card, CardContent } from '@/components/ui/card';
import { Image, FileText, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Image,
    title: '5 张专业图片',
    description:
      '自动生成符合亚马逊标准的白底图、场景图、细节图、尺寸图和功能图。',
  },
  {
    icon: FileText,
    title: 'SEO 优化文案',
    description:
      'AI 生成的标题、5 点描述和产品说明，专为亚马逊搜索和转化优化。',
  },
  {
    icon: CheckCircle,
    title: '亚马逊合规',
    description:
      '自动检查背景色、分辨率、水印和产品占比，确保符合亚马逊规范。',
  },
];

export function FeatureCards() {
  return (
    <section className="border-t bg-muted/30 py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">为什么选择我们？</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            创建专业亚马逊商品所需的一切功能
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden border-2">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
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
