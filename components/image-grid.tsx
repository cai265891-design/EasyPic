'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import { ImageItem } from '@/types';
import { formatBytes } from '@/lib/utils';

interface ImageGridProps {
  images: ImageItem[];
  onRegenerate?: (type: ImageItem['type']) => void;
  isGenerating?: boolean; // 是否正在生成中
}

const typeLabels: Record<ImageItem['type'], string> = {
  original: '原图',
  main: '主图（白底）',
  lifestyle: '场景图',
  detail: '细节图',
  dimension: '尺寸图',
  feature: '功能图',
};

const typeDescriptions: Record<ImageItem['type'], string> = {
  original: '您上传的图片',
  main: '纯白背景，产品居中',
  lifestyle: '真实使用场景',
  detail: '核心功能特写',
  dimension: '尺寸对比和测量',
  feature: '带文字的卖点展示',
};

// 期望生成的图片类型顺序
const expectedImageTypes: ImageItem['type'][] = ['original', 'main', 'lifestyle', 'detail', 'dimension', 'feature'];

export function ImageGrid({ images, onRegenerate, isGenerating = false }: ImageGridProps) {
  // 如果正在生成,显示所有期望的占位符
  const displayImages = isGenerating
    ? expectedImageTypes.map((type) => {
        const existing = images.find((img) => img.type === type);
        return (
          existing || {
            id: `placeholder-${type}`,
            type,
            url: '',
            width: 0,
            height: 0,
            fileSize: 0,
          }
        );
      })
    : images;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displayImages.map((img) => {
        const isPlaceholder = !img.url;

        return (
          <Card key={img.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Image Preview */}
              <div className="relative aspect-square bg-muted">
                {isPlaceholder ? (
                  // 加载中占位符
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-100 to-gray-200">
                    <Loader2 className="size-12 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">正在生成中...</p>
                  </div>
                ) : (
                  <Image
                    src={img.url}
                    alt={typeLabels[img.type]}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute left-2 top-2">
                  <Badge variant="secondary">{typeLabels[img.type]}</Badge>
                </div>
              </div>

            {/* Image Info */}
            <div className="space-y-2 p-4">
              <p className="text-sm font-medium">{typeLabels[img.type]}</p>
              <p className="text-xs text-muted-foreground">{typeDescriptions[img.type]}</p>
              {!isPlaceholder && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {img.width} × {img.height}
                  </span>
                  <span>{formatBytes(img.fileSize)}</span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="gap-2 p-4 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isPlaceholder}
              onClick={() => {
                const link = document.createElement('a');
                link.href = img.url;
                link.download = `${img.type}.jpg`;
                link.click();
              }}
            >
              <Download className="mr-2 size-4" />
              下载
            </Button>
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                disabled={isPlaceholder}
                onClick={() => onRegenerate(img.type)}
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        );
      })}
    </div>
  );
}
