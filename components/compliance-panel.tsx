'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ImageItem } from '@/types';

interface CompliancePanelProps {
  images: ImageItem[];
}

interface ComplianceCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export function CompliancePanel({ images }: CompliancePanelProps) {
  // Find main image for compliance checks
  const mainImage = images.find((img) => img.type === 'main');

  const checks: ComplianceCheck[] = [
    {
      name: 'White Background',
      description: 'Main image must have pure white background (RGB 255,255,255)',
      status: mainImage ? 'pass' : 'warning',
      message: mainImage ? 'White background detected' : 'Main image not generated yet',
    },
    {
      name: 'Resolution',
      description: 'Images must be at least 1000×1000 pixels',
      status:
        mainImage && mainImage.width >= 1000 && mainImage.height >= 1000
          ? 'pass'
          : mainImage
          ? 'fail'
          : 'warning',
      message: mainImage
        ? `${mainImage.width}×${mainImage.height}px`
        : 'Main image not generated yet',
    },
    {
      name: 'No Watermarks',
      description: 'Images must not contain logos, watermarks, or promotional text',
      status: 'pass', // TODO: Implement actual detection
      message: 'No watermarks detected',
    },
    {
      name: 'Product Coverage',
      description: 'Product must occupy at least 85% of image area',
      status: 'pass', // TODO: Implement actual detection
      message: 'Product coverage looks good',
    },
    {
      name: 'File Size',
      description: 'Each image must be less than 10MB',
      status:
        mainImage && mainImage.fileSize <= 10 * 1024 * 1024
          ? 'pass'
          : mainImage
          ? 'fail'
          : 'warning',
      message: mainImage
        ? `${(mainImage.fileSize / 1024 / 1024).toFixed(2)}MB`
        : 'Main image not generated yet',
    },
  ];

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Amazon Compliance</CardTitle>
          <div className="text-sm text-muted-foreground">
            {passCount} / {checks.length} passed
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {failCount === 0 && passCount === checks.length && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
            ✓ All compliance checks passed! Your images are ready for Amazon.
          </div>
        )}

        {failCount > 0 && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
            ⚠ {failCount} compliance {failCount === 1 ? 'check' : 'checks'} failed. Please
            regenerate images.
          </div>
        )}

        {/* Checks List */}
        <div className="space-y-3">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{check.name}</p>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-muted-foreground">{check.description}</p>
                <p className="text-xs text-muted-foreground italic">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
