'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check, Plus, X } from 'lucide-react';
import { Copywriting } from '@/types';

interface CopywriterPanelProps {
  value: Copywriting;
  onChange?: (value: Copywriting) => void;
  readOnly?: boolean;
}

export function CopywriterPanel({ value, onChange, readOnly = false }: CopywriterPanelProps) {
  const [copied, setCopied] = useState(false);
  const [bulletPoints, setBulletPoints] = useState(value.bulletPoints);
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description);

  const handleCopyAll = async () => {
    const text = `Title:\n${title}\n\nBullet Points:\n${bulletPoints.join('\n')}\n\nDescription:\n${description}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateBullet = (index: number, text: string) => {
    const newPoints = [...bulletPoints];
    newPoints[index] = text;
    setBulletPoints(newPoints);
    onChange?.({ ...value, bulletPoints: newPoints });
  };

  const handleAddBullet = () => {
    const newPoints = [...bulletPoints, 'New bullet point'];
    setBulletPoints(newPoints);
    onChange?.({ ...value, bulletPoints: newPoints });
  };

  const handleRemoveBullet = (index: number) => {
    const newPoints = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(newPoints);
    onChange?.({ ...value, bulletPoints: newPoints });
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    onChange?.({ ...value, title: text });
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    onChange?.({ ...value, description: text });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Generated Copywriting</h3>
        <Button variant="outline" size="sm" onClick={handleCopyAll}>
          {copied ? (
            <>
              <Check className="mr-2 size-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 size-4" />
              Copy All
            </>
          )}
        </Button>
      </div>

      {/* Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            readOnly={readOnly}
            placeholder="Product title..."
            className="text-base"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {title.length} / 200 characters
          </p>
        </CardContent>
      </Card>

      {/* Bullet Points */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">5-Point Description</CardTitle>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={handleAddBullet}>
                <Plus className="mr-1 size-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {bulletPoints.map((point, idx) => (
            <div key={idx} className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={point}
                  onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                  readOnly={readOnly}
                  rows={2}
                  className="resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {point.length} / 250 characters
                </p>
              </div>
              {!readOnly && bulletPoints.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBullet(idx)}
                  className="shrink-0"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            readOnly={readOnly}
            rows={8}
            placeholder="Detailed product description..."
            className="resize-none"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {description.length} / 2000 characters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
