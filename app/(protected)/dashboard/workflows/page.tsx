'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function WorkflowTestPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const startWorkflow = async () => {
    if (!imageUrl) {
      alert('请输入图片 URL');
      return;
    }

    setLoading(true);
    setResult(null);
    setWorkflowId(null);

    try {
      const res = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          category: category || undefined,
          brand: brand || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '启动工作流失败');
      }

      const data = await res.json();
      setWorkflowId(data.workflowId);
      alert(`工作流已启动! ID: ${data.workflowId}`);

      // 开始轮询状态
      pollWorkflowStatus(data.workflowId);
    } catch (error: any) {
      alert(`错误: ${error.message}`);
      setLoading(false);
    }
  };

  const pollWorkflowStatus = async (id: string) => {
    const maxAttempts = 60; // 最多轮询 2 分钟
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`/api/workflows/${id}`);
        if (!res.ok) {
          throw new Error('查询失败');
        }

        const data = await res.json();
        setResult(data);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
          setLoading(false);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          alert('轮询超时');
        }
      } catch (error) {
        console.error('轮询错误:', error);
      }
    }, 2000); // 每 2 秒轮询一次
  };

  return (
    <div className="container max-w-4xl space-y-6 px-6 py-8">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-bold">工作流系统测试</h1>
        <p className="text-muted-foreground">
          测试图片识别 → 文案生成 → 图片生成完整流程
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>启动工作流</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              图片 URL <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="https://example.com/product.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">类别（可选）</label>
            <Input
              placeholder="例如: Electronics, Home & Kitchen"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">品牌（可选）</label>
            <Input
              placeholder="例如: MyBrand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <Button onClick={startWorkflow} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                处理中...
              </>
            ) : (
              '启动工作流'
            )}
          </Button>
        </CardContent>
      </Card>

      {workflowId && (
        <Card>
          <CardHeader>
            <CardTitle>工作流 ID: {workflowId}</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">状态</p>
                  <p className="text-lg">
                    {result.status} - {result.currentStep}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${result.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    进度: {result.progress}%
                  </p>
                </div>

                {result.product && (
                  <div>
                    <p className="text-sm font-medium">✅ 图片识别结果</p>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(result.product, null, 2)}
                    </pre>
                  </div>
                )}

                {result.listing && (
                  <div>
                    <p className="text-sm font-medium">✅ 文案生成结果</p>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(result.listing, null, 2)}
                    </pre>
                  </div>
                )}

                {result.images && (
                  <div>
                    <p className="text-sm font-medium">✅ 图片生成结果</p>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                      {JSON.stringify(result.images, null, 2)}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <div className="rounded bg-red-50 p-3 text-red-600">
                    <p className="font-medium">错误:</p>
                    <p>{result.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">等待结果...</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
