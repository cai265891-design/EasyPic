'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Uploader } from '@/components/uploader';
import { createProject } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [specs, setSpecs] = useState('');
  const [category, setCategory] = useState('');
  const [style, setStyle] = useState('modern');
  const [language, setLanguage] = useState('en');

  const handleGenerate = async () => {
    if (files.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({
        name: projectName || `Project ${new Date().toLocaleDateString()}`,
        files,
        options: {
          productName: projectName,
          keyFeatures,
          specs,
          category,
          style,
          language,
        },
      });

      // Redirect to result page
      router.push(`/result/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-bold">Generate Amazon Images</h1>
        <p className="text-lg text-muted-foreground">
          Upload your product photo and let AI create 5 professional images + SEO copy
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>1. Upload Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Uploader onFiles={setFiles} maxFiles={20} />
        </CardContent>
      </Card>

      {/* Product Information (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>2. Product Information (Optional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Provide details to help AI generate more accurate copy
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., Stainless Steel Water Bottle"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Key Features (comma separated)</Label>
            <Input
              id="features"
              placeholder="e.g., insulated, leak-proof, BPA-free"
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs">Product Specifications</Label>
            <Textarea
              id="specs"
              placeholder="e.g., Capacity: 32oz, Material: 18/8 stainless steel, Dimensions: 10.5 x 3 inches"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>3. Generation Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home & Kitchen</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="sports">Sports & Outdoors</SelectItem>
                <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                <SelectItem value="toys">Toys & Games</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Image Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Copy Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={loading || files.length === 0}
          className="gap-2 px-12"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Images & Copy
            </>
          )}
        </Button>
      </div>

      {/* Cost Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>This will consume 10 credits</p>
      </div>
    </div>
  );
}
