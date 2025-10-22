import { Project, CreateProjectPayload } from '@/types';
import { projectDemo, progressTicker } from './mock';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/**
 * Create a new project and trigger n8n workflow
 * TODO: Replace with actual implementation that calls Next.js API route
 */
export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  if (useMock) {
    // Mock: create project and simulate progress
    const proj = await projectDemo();
    progressTicker(proj.id); // Async status updates
    return proj;
  }

  // TODO: Real implementation
  // const formData = new FormData();
  // formData.append('name', payload.name);
  // if (payload.files) {
  //   payload.files.forEach(file => formData.append('files', file));
  // }
  // formData.append('options', JSON.stringify(payload.options));
  //
  // const res = await fetch('/api/projects', {
  //   method: 'POST',
  //   body: formData,
  // });
  //
  // if (!res.ok) throw new Error('Failed to create project');
  // return res.json();

  throw new Error('Not implemented - set NEXT_PUBLIC_USE_MOCK=true to use mock data');
}

/**
 * Get project details by ID
 * TODO: Replace with actual API call
 */
export async function getProject(id: string): Promise<Project> {
  if (useMock) {
    return projectDemo(id);
  }

  // TODO: Real implementation
  // const res = await fetch(`/api/projects/${id}`);
  // if (!res.ok) throw new Error('Failed to fetch project');
  // return res.json();

  throw new Error('Not implemented - set NEXT_PUBLIC_USE_MOCK=true to use mock data');
}

/**
 * Regenerate a specific image type
 * TODO: Trigger n8n image generation workflow
 */
export async function regenerateImage(
  projectId: string,
  type: import('@/types').GeneratedImageType
): Promise<boolean> {
  if (useMock) {
    console.log(`Mock: Regenerating ${type} image for project ${projectId}`);
    return true;
  }

  // TODO: Real implementation
  // const res = await fetch(process.env.N8N_WEBHOOK_IMAGES!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ projectId, types: [type] }),
  // });
  // return res.ok;

  throw new Error('Not implemented');
}

/**
 * Regenerate copywriting for a project
 * TODO: Trigger n8n copywriting workflow
 */
export async function regenerateCopy(projectId: string): Promise<boolean> {
  if (useMock) {
    console.log(`Mock: Regenerating copy for project ${projectId}`);
    return true;
  }

  // TODO: Real implementation
  // const res = await fetch(process.env.N8N_WEBHOOK_COPYWRITING!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ projectId }),
  // });
  // return res.ok;

  throw new Error('Not implemented');
}

/**
 * Download all project assets as ZIP
 * TODO: Implement backend ZIP packaging or parallel download
 */
export async function downloadZip(projectId: string): Promise<boolean> {
  if (useMock) {
    console.log(`Mock: Downloading ZIP for project ${projectId}`);
    // Simulate download delay
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  // TODO: Real implementation
  // Option 1: Backend generates ZIP
  // window.location.href = `/api/projects/${projectId}/download`;
  //
  // Option 2: Client-side parallel download (needs JSZip)
  // const project = await getProject(projectId);
  // const zip = new JSZip();
  // for (const img of project.images) {
  //   const blob = await fetch(img.url).then(r => r.blob());
  //   zip.file(`${img.type}.jpg`, blob);
  // }
  // const content = await zip.generateAsync({ type: 'blob' });
  // const link = document.createElement('a');
  // link.href = URL.createObjectURL(content);
  // link.download = `project-${projectId}.zip`;
  // link.click();

  throw new Error('Not implemented');
}

/**
 * List all projects for current user
 * TODO: Implement with pagination
 */
export async function listProjects(): Promise<Project[]> {
  if (useMock) {
    // Return mock project list
    return [
      await projectDemo('demo-001'),
      {
        ...(await projectDemo('demo-002')),
        name: 'Wireless Earbuds',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        ...(await projectDemo('demo-003')),
        name: 'Smart Watch',
        status: 'analyzing',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];
  }

  // TODO: Real implementation
  // const res = await fetch('/api/projects');
  // if (!res.ok) throw new Error('Failed to fetch projects');
  // return res.json();

  throw new Error('Not implemented');
}
