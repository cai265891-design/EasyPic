'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploaderProps {
  onFiles: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
}

export function Uploader({
  onFiles,
  maxFiles = 20,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = ['image/jpeg', 'image/png'],
}: UploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!accept.includes(file.type)) {
        return `文件类型无效。仅支持 ${accept.join(', ')}`;
      }
      if (file.size > maxSize) {
        return `文件过大。最大 ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          setError(error);
          return;
        }

        if (files.length + validFiles.length >= maxFiles) {
          setError(`最多允许 ${maxFiles} 个文件`);
          break;
        }

        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }

      const updatedFiles = [...files, ...validFiles];
      const updatedPreviews = [...previews, ...validPreviews];

      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
      setError('');
      onFiles(updatedFiles);
    },
    [files, previews, maxFiles, validateFile, onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);

      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(previews[index]);

      setFiles(newFiles);
      setPreviews(newPreviews);
      onFiles(newFiles);
    },
    [files, previews, onFiles]
  );

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          'relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={accept.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">拖拽图片到此处</p>
            <p className="text-sm text-muted-foreground">或点击选择文件</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>支持 JPG、PNG • 最多 {maxFiles} 个文件 • 每个最大 {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={preview}
                alt={`Preview ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="truncate text-xs text-white">{files[idx]?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
