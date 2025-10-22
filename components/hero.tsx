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
            <span>AI-Powered Amazon Image Generator</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Generate Amazon-Ready
            <span className="block bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Product Images in Minutes
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Upload one photo and let AI create 5 professional Amazon main images + SEO-optimized
            copy. Save time, reduce costs, and boost conversions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/generate">
                Start Generating <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
            <div>
              <p className="text-3xl font-bold">5 Images</p>
              <p className="text-sm text-muted-foreground">Auto-generated</p>
            </div>
            <div>
              <p className="text-3xl font-bold">&lt;5 Min</p>
              <p className="text-sm text-muted-foreground">Processing time</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Amazon compliant</p>
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
