import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks/n8n
 * Receive callbacks from n8n workflows
 *
 * Expected payload:
 * {
 *   projectId: string;
 *   type: 'analysis_completed' | 'copywriting_completed' | 'images_completed';
 *   data: any;
 * }
 *
 * TODO: Implement actual logic:
 * 1. Verify webhook signature (security)
 * 2. Parse payload
 * 3. Update project in database based on type:
 *    - analysis_completed: Save analysis data
 *    - copywriting_completed: Save copywriting data
 *    - images_completed: Save image URLs and update status to 'completed'
 * 4. Return success response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, type, data } = body;

    // Mock implementation
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      console.log(`[Mock] n8n webhook received: ${type} for project ${projectId}`);
      return NextResponse.json({ success: true });
    }

    // TODO: Verify webhook signature
    // const signature = req.headers.get('x-n8n-signature');
    // if (!verifyN8nSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // TODO: Real implementation
    // switch (type) {
    //   case 'analysis_completed':
    //     // Save analysis data
    //     await prisma.project.update({
    //       where: { id: projectId },
    //       data: {
    //         analysis: data,
    //         status: 'writing', // Move to next stage
    //       },
    //     });
    //     break;

    //   case 'copywriting_completed':
    //     // Save copywriting data
    //     await prisma.copywriting.create({
    //       data: {
    //         projectId,
    //         title: data.title,
    //         bulletPoints: data.bulletPoints,
    //         description: data.description,
    //         language: data.language || 'en',
    //       },
    //     });
    //     await prisma.project.update({
    //       where: { id: projectId },
    //       data: { status: 'generating' }, // Move to next stage
    //     });
    //     break;

    //   case 'images_completed':
    //     // Save images
    //     await prisma.image.createMany({
    //       data: data.images.map((img: any) => ({
    //         projectId,
    //         type: img.type,
    //         url: img.url,
    //         width: img.width,
    //         height: img.height,
    //         fileSize: img.fileSize,
    //       })),
    //     });
    //     await prisma.project.update({
    //       where: { id: projectId },
    //       data: { status: 'completed' },
    //     });
    //     break;

    //   default:
    //     return NextResponse.json({ error: 'Unknown webhook type' }, { status: 400 });
    // }

    // return NextResponse.json({ success: true });

    return NextResponse.json(
      { error: 'Not implemented - set NEXT_PUBLIC_USE_MOCK=true to test' },
      { status: 501 }
    );
  } catch (error) {
    console.error('POST /api/webhooks/n8n error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify n8n webhook signature
 * TODO: Implement actual signature verification
 */
function verifyN8nSignature(signature: string | null, body: any): boolean {
  if (!signature) return false;

  // const secret = process.env.N8N_SIGNATURE_SECRET!;
  // const computedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(JSON.stringify(body))
  //   .digest('hex');

  // return signature === computedSignature;

  return true; // Mock: always pass
}
