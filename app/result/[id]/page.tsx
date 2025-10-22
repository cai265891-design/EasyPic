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
  pending: 'Pending',
  analyzing: 'Analyzing Image',
  writing: 'Writing Copy',
  generating: 'Generating Images',
  completed: 'Completed',
  failed: 'Failed',
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
      const data = await getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Poll for updates if project is not completed
  useEffect(() => {
    if (!project || project.status === 'completed' || project.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      fetchProject();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [project?.status]);

  const handleRegenerateImage = async (type: Project['images'][number]['type']) => {
    if (!project) return;
    try {
      await regenerateImage(project.id, type);
      alert(`Regenerating ${type} image...`);
      // TODO: Show toast notification instead
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      alert('Failed to regenerate image');
    }
  };

  const handleRegenerateCopy = async () => {
    if (!project) return;
    try {
      await regenerateCopy(project.id);
      alert('Regenerating copywriting...');
      // TODO: Show toast notification instead
    } catch (error) {
      console.error('Failed to regenerate copy:', error);
      alert('Failed to regenerate copywriting');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container max-w-4xl px-6 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Project Not Found"
          description={error || 'The project you are looking for does not exist'}
          action={{
            label: 'Back to Dashboard',
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
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {new Date(project.createdAt).toLocaleDateString()}
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
            This usually takes 2-5 minutes. You can leave this page and come back later.
          </p>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Generation failed</p>
          <p className="text-sm">Please try creating a new project or contact support.</p>
        </div>
      )}

      {/* Content Tabs */}
      {project.status === 'completed' && (
        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="copy">Copywriting</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Images</h2>
              <Button variant="outline" size="sm" onClick={() => handleRegenerateImage('main')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate All
              </Button>
            </div>
            <ImageGrid images={project.images} onRegenerate={handleRegenerateImage} />
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Product Copywriting</h2>
              <Button variant="outline" size="sm" onClick={handleRegenerateCopy}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Copy
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
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
          <h3 className="mb-2 text-xl font-semibold">AI is working on your project</h3>
          <p className="text-muted-foreground">
            We&apos;re analyzing your image, generating copy, and creating 5 professional images
          </p>
        </div>
      )}
    </div>
  );
}
