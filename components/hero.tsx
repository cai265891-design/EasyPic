'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
      <div className="container px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI 驱动的亚马逊图片生成器</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            生成符合亚马逊标准的
            <span className="block bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              专业商品图片
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            上传一张照片，让 AI 为您创建 5 张专业亚马逊主图 + SEO 优化文案。
            节省时间、降低成本、提升转化率。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/generate">
              <Button size="lg" className="gap-2">
                开始生成 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                查看定价
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
            <div>
              <p className="text-3xl font-bold">5 张图片</p>
              <p className="text-sm text-muted-foreground">自动生成</p>
            </div>
            <div>
              <p className="text-3xl font-bold">&lt;5 分钟</p>
              <p className="text-sm text-muted-foreground">处理时间</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">符合亚马逊规范</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl"></div>
      </div>
    </section>
  );
}
