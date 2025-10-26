'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGrid } from '@/components/image-grid';
import { CopywriterPanel } from '@/components/copywriter-panel';
import { CompliancePanel } from '@/components/compliance-panel';
import { DownloadZipButton } from '@/components/download-zip-button';
import { EmptyState } from '@/components/empty-state';
import { getProject, regenerateImage, regenerateCopy } from '@/lib/api';
import { Project } from '@/types';
import { Loader2, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const statusLabels: Record<Project['status'], string> = {
  pending: '等待中',
  analyzing: '图片分析中',
  writing: '文案生成中',
  generating: '图片生成中',
  completed: '已完成',
  failed: '失败',
};

const statusProgress: Record<Project['status'], number> = {
  pending: 0,
  analyzing: 25,
  writing: 50,
  generating: 75,
  completed: 100,
  failed: 0,
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      // 调用工作流 API
      const res = await fetch(`/api/workflows/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch workflow');

      const workflow = await res.json();
      console.log('[ResultPage] Fetched workflow:', projectId, 'status:', workflow.status);

      // 转换为 Project 格式
      const data: Project = {
        id: workflow.id,
        name: `${workflow.product?.description?.split(/[,，。.]/)[0] || '商品'} - Listing 项目`,
        status: mapWorkflowStatus(workflow.status, workflow),
        createdAt: workflow.createdAt,
        images: buildImages(workflow),
        copywriting: workflow.listing ? {
          title: workflow.listing.title,
          bulletPoints: workflow.listing.bulletPoints,
          description: workflow.listing.description,
          language: 'en',
        } : undefined,
        analysis: workflow.product ? {
          category: workflow.input?.category || 'general',
          keywords: workflow.product.keywords,
          productType: workflow.product.description?.split(/[,，]/)[0] || 'Product',
          mainColor: '',
          material: '',
          keyFeatures: [],
          detailPoints: [],
          suggestedScenes: [],
        } : undefined,
      };

      setProject(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  // 映射工作流状态到项目状态
  const mapWorkflowStatus = (status: string, workflow: any): Project['status'] => {
    // 如果有产品和listing数据,即使FAILED也认为部分成功
    if (status === 'FAILED' && workflow.product && workflow.listing) {
      return 'completed'; // 显示为完成,图片生成失败不影响其他数据展示
    }

    switch (status) {
      case 'PENDING': return 'pending';
      case 'PROCESSING': return 'analyzing';
      case 'COMPLETED': return 'completed';
      case 'FAILED': return 'failed';
      default: return 'analyzing';
    }
  };

  // 构建图片数组
  const buildImages = (workflow: any): Project['images'] => {
    const images: Project['images'] = [];

    // 原图
    if (workflow.input?.imageUrl) {
      images.push({
        id: 'original',
        type: 'original',
        url: workflow.input.imageUrl,
        width: 1200,
        height: 1200,
        fileSize: 0,
      });
    }

    // 生成的图片
    if (workflow.images?.items && Array.isArray(workflow.images.items)) {
      const typeMap: { [key: number]: Project['images'][number]['type'] } = {
        0: 'main',
        1: 'lifestyle',
        2: 'detail',
        3: 'dimension',
        4: 'feature',
      };

      console.log(`[ResultPage] Processing ${workflow.images.items.length} generated images`);

      if (workflow.images.items.length === 0) {
        console.warn('[ResultPage] ⚠️ 警告: 图片数组为空,可能是图片生成失败');
        // 如果 workflow 状态是 COMPLETED 但没有图片,记录错误信息
        if (workflow.status === 'COMPLETED') {
          console.error('[ResultPage] ❌ 工作流已完成但没有生成图片,这是一个异常状态');
          console.error('[ResultPage] 错误信息:', workflow.error);
        }
      }

      workflow.images.items.forEach((img: any, index: number) => {
        console.log(`[ResultPage] Adding image ${index}:`, img.imageUrl);
        images.push({
          id: img.id,
          type: typeMap[index] || 'main',
          url: img.imageUrl,
          width: 2000,
          height: 2000,
          fileSize: 0,
        });
      });
    } else {
      console.log('[ResultPage] No generated images found in workflow data');
    }

    console.log(`[ResultPage] Total images in array: ${images.length}`);
    return images;
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Poll for updates if project is not completed
  useEffect(() => {
    if (!project || project.status === 'completed' || project.status === 'failed') {
      console.log('[ResultPage] Polling stopped. Status:', project?.status);
      return;
    }

    console.log('[ResultPage] Starting polling for status:', project.status);
    const interval = setInterval(() => {
      console.log('[ResultPage] Polling...');
      fetchProject();
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('[ResultPage] Cleaning up interval');
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.status]);

  const handleRegenerateImage = async (type: Project['images'][number]['type']) => {
    if (!project) return;
    // Cannot regenerate original image
    if (type === 'original') {
      alert('无法重新生成原图');
      return;
    }
    try {
      await regenerateImage(project.id, type);
      alert(`正在重新生成 ${type} 图片...`);
      // TODO: Show toast notification instead
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      alert('重新生成图片失败');
    }
  };

  const handleRegenerateCopy = async () => {
    if (!project) return;
    try {
      await regenerateCopy(project.id);
      alert('正在重新生成文案...');
      // TODO: Show toast notification instead
    } catch (error) {
      console.error('Failed to regenerate copy:', error);
      alert('重新生成文案失败');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container max-w-4xl px-6 py-16">
        <EmptyState
          icon={AlertCircle}
          title="项目未找到"
          description={error || '您查找的项目不存在'}
          action={{
            label: '返回控制台',
            onClick: () => router.push('/dashboard'),
          }}
        />
      </div>
    );
  }

  const isProcessing = !['completed', 'failed'].includes(project.status);
  const isFailed = project.status === 'failed';

  return (
    <div className="container max-w-7xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={project.status === 'completed' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {statusLabels[project.status]}
          </Badge>
          {project.status === 'completed' && <DownloadZipButton projectId={project.id} />}
        </div>
      </div>

      {/* Progress Bar (for processing states) */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{statusLabels[project.status]}</span>
            <span className="text-muted-foreground">{statusProgress[project.status]}%</span>
          </div>
          <Progress value={statusProgress[project.status]} className="h-2" />
          <p className="text-xs text-muted-foreground">
            通常需要 2-5 分钟。您可以离开此页面稍后再来查看。
          </p>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">生成失败</p>
          <p className="text-sm">请尝试创建新项目或联系客服。</p>
        </div>
      )}

      {/* Content Tabs */}
      {project.status === 'completed' && (
        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="images">图片</TabsTrigger>
            <TabsTrigger value="copy">文案</TabsTrigger>
            <TabsTrigger value="compliance">合规检查</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">生成的图片</h2>
              <Button variant="outline" size="sm" onClick={() => handleRegenerateImage('main')}>
                <RefreshCw className="mr-2 size-4" />
                全部重新生成
              </Button>
            </div>

            {/* 图片生成失败警告 */}
            {project.images.filter(img => img.type !== 'original').length === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 text-yellow-600" />
                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-yellow-900">图片生成失败</h3>
                    <p className="mb-3 text-sm text-yellow-800">
                      AI 图片生成过程中出现错误,未能生成商品展示图。您可以:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateImage('main')}
                        className="bg-white"
                      >
                        <RefreshCw className="mr-2 size-4" />
                        重新生成图片
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                      >
                        返回控制台
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ImageGrid
              images={project.images}
              onRegenerate={handleRegenerateImage}
              isGenerating={isProcessing}
            />
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">商品文案</h2>
              <Button variant="outline" size="sm" onClick={handleRegenerateCopy}>
                <RefreshCw className="mr-2 size-4" />
                重新生成文案
              </Button>
            </div>
            {project.copywriting && (
              <CopywriterPanel
                value={project.copywriting}
                onChange={(newValue) => {
                  // TODO: Save changes to backend
                  setProject({ ...project, copywriting: newValue });
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="compliance">
            <CompliancePanel images={project.images} />
          </TabsContent>
        </Tabs>
      )}

      {/* Processing State Content */}
      {isProcessing && (
        <div className="rounded-2xl border-2 border-dashed p-12 text-center">
          <Loader2 className="mx-auto mb-4 size-16 animate-spin text-primary" />
          <h3 className="mb-2 text-xl font-semibold">AI 正在处理您的项目</h3>
          <p className="text-muted-foreground">
            我们正在分析您的图片、生成文案并创建 5 张专业图片
          </p>
        </div>
      )}
    </div>
  );
}
