'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { downloadZip } from '@/lib/api';

interface DownloadZipButtonProps {
  projectId: string;
  disabled?: boolean;
}

export function DownloadZipButton({ projectId, disabled }: DownloadZipButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadZip(projectId);
      // TODO: Actual implementation will trigger browser download
      console.log('Download started for project:', projectId);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download ZIP. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      size="lg"
      className="gap-2"
    >
      {isDownloading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Preparing ZIP...
        </>
      ) : (
        <>
          <Download className="size-4" />
          Download All (ZIP)
        </>
      )}
    </Button>
  );
}
