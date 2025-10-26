import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function BeforeAfter() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">见证转变</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            从一张照片到 5 张专业的 Amazon 商品展示图
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:gap-12">
          {/* Before */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
                原图
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
                  原始产品图片
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
                生成后
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['主图', '场景图', '细节图', '尺寸图', '功能图'].slice(0, 4).map((type, idx) => (
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
              + SEO 优化的商品文案
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
