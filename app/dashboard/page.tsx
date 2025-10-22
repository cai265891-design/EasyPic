'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UsageBar } from '@/components/usage-bar';
import { EmptyState } from '@/components/empty-state';
import { Plus, Eye, Download, Loader2, FolderOpen } from 'lucide-react';
import { listProjects } from '@/lib/api';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusColors: Record<Project['status'], string> = {
  pending: 'bg-gray-500',
  analyzing: 'bg-blue-500',
  writing: 'bg-purple-500',
  generating: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user credits (TODO: fetch from actual user data)
  const userCredits = 250;
  const maxCredits = 300;
  const projectsThisMonth = 5;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your Amazon image generation projects</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/generate">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Usage Bar */}
      <UsageBar credits={userCredits} maxCredits={maxCredits} projectsThisMonth={projectsThisMonth} />

      {/* Projects Table */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to start generating Amazon-ready images and copy"
          action={{
            label: 'Create Project',
            onClick: () => router.push('/generate'),
          }}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[project.status]}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(project.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/result/${project.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {project.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
