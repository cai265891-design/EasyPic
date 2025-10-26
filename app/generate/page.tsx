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
      alert('请至少上传一张图片');
      return;
    }

    setLoading(true);
    try {
      // 1. 上传图片
      const formData = new FormData();
      formData.append('file', files[0]);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('图片上传失败');
      }

      const { imageUrl } = await uploadRes.json();

      // 2. 启动工作流
      const workflowRes = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          category,
          brand: projectName,
        }),
      });

      if (!workflowRes.ok) {
        throw new Error('启动工作流失败');
      }

      const { workflowId } = await workflowRes.json();

      // 3. 跳转到结果页面
      router.push(`/result/${workflowId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('创建项目失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-bold">生成亚马逊商品图</h1>
        <p className="text-lg text-muted-foreground">
          上传您的商品照片，让 AI 创建 5 张专业图片 + SEO 文案
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>1. 上传商品图片</CardTitle>
        </CardHeader>
        <CardContent>
          <Uploader onFiles={setFiles} maxFiles={20} />
        </CardContent>
      </Card>

      {/* Product Information (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>2. 商品信息（可选）</CardTitle>
          <p className="text-sm text-muted-foreground">
            提供详细信息帮助 AI 生成更准确的文案
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">商品名称</Label>
            <Input
              id="name"
              placeholder="例如：不锈钢保温杯"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">核心特点（逗号分隔）</Label>
            <Input
              id="features"
              placeholder="例如：保温、防漏、不含BPA"
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs">商品规格</Label>
            <Textarea
              id="specs"
              placeholder="例如：容量：950ml，材质：18/8不锈钢，尺寸：26.5 x 7.6 cm"
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
          <CardTitle>3. 生成设置</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category">商品类别</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">家居厨房</SelectItem>
                <SelectItem value="electronics">电子产品</SelectItem>
                <SelectItem value="clothing">服装</SelectItem>
                <SelectItem value="sports">运动户外</SelectItem>
                <SelectItem value="beauty">美妆个护</SelectItem>
                <SelectItem value="toys">玩具游戏</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">图片风格</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">现代</SelectItem>
                <SelectItem value="minimal">简约</SelectItem>
                <SelectItem value="luxury">奢华</SelectItem>
                <SelectItem value="playful">活泼</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">文案语言</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">英语 (美国)</SelectItem>
                <SelectItem value="es">西班牙语</SelectItem>
                <SelectItem value="de">德语</SelectItem>
                <SelectItem value="fr">法语</SelectItem>
                <SelectItem value="ja">日语</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
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
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              生成图片和文案
            </>
          )}
        </Button>
      </div>

      {/* Cost Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>将消耗 10 积分</p>
      </div>
    </div>
  );
}
