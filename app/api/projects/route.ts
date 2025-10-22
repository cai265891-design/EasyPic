import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/projects
 * Create a new project and trigger n8n analyze workflow
 *
 * TODO: Implement actual logic:
 * 1. Authenticate user (use auth() from @/auth)
 * 2. Check user credits (>= 10)
 * 3. Upload images to R2/S3
 * 4. Create project record in database
 * 5. Deduct credits
 * 6. Trigger n8n webhook (process.env.N8N_WEBHOOK_ANALYZE)
 * 7. Return project ID
 */
export async function POST(req: NextRequest) {
  try {
    // Mock implementation
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      const body = await req.json();

      // Simulate project creation
      const mockProject = {
        id: `demo-${Date.now()}`,
        name: body.name || 'Untitled Project',
        status: 'analyzing',
        createdAt: new Date().toISOString(),
        images: [],
        copywriting: null,
      };

      return NextResponse.json(mockProject, { status: 201 });
    }

    // TODO: Real implementation
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const formData = await req.formData();
    // const files = formData.getAll('files') as File[];
    // const options = JSON.parse(formData.get('options') as string || '{}');

    // // Check user credits
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    // });
    // if (!user || user.credits < 10) {
    //   return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    // }

    // // Upload images to R2
    // const imageUrl = await uploadToR2(files[0]);

    // // Create project
    // const project = await prisma.project.create({
    //   data: {
    //     userId: session.user.id,
    //     name: options.productName || 'Untitled Project',
    //     status: 'pending',
    //   },
    // });

    // // Deduct credits
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: { credits: { decrement: 10 } },
    // });

    // await prisma.creditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     amount: -10,
    //     type: 'generate_image',
    //     projectId: project.id,
    //   },
    // });

    // // Trigger n8n analyze workflow
    // await fetch(process.env.N8N_WEBHOOK_ANALYZE!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     projectId: project.id,
    //     imageUrl,
    //     userInputs: options,
    //   }),
    // });

    // return NextResponse.json(project, { status: 201 });

    return NextResponse.json(
      { error: 'Not implemented - set NEXT_PUBLIC_USE_MOCK=true to test' },
      { status: 501 }
    );
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
