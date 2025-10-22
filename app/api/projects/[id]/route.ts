import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects/:id
 * Get project details by ID
 *
 * TODO: Implement actual logic:
 * 1. Authenticate user
 * 2. Fetch project from database
 * 3. Verify user owns the project
 * 4. Return project with images and copywriting
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Mock implementation
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      // Return mock project (imported from lib/mock.ts)
      const { projectDemo } = await import('@/lib/mock');
      const project = await projectDemo(projectId);
      return NextResponse.json(project);
    }

    // TODO: Real implementation
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const project = await prisma.project.findUnique({
    //   where: { id: projectId },
    //   include: {
    //     images: true,
    //     copywriting: true,
    //   },
    // });

    // if (!project) {
    //   return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    // }

    // if (project.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // return NextResponse.json(project);

    return NextResponse.json(
      { error: 'Not implemented - set NEXT_PUBLIC_USE_MOCK=true to test' },
      { status: 501 }
    );
  } catch (error) {
    console.error(`GET /api/projects/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
