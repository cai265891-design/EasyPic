import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { imageRecognitionQueue } from "@/lib/queues";
import { z } from "zod";

const startWorkflowSchema = z.object({
  imageUrl: z.string().url("请提供有效的图片 URL"),
  category: z.string().optional(),
  brand: z.string().optional(),
});

/**
 * 测试用 API - 无需登录
 * POST /api/workflows-test/start
 */
export async function POST(req: NextRequest) {
  try {
    // 解析和验证请求体
    const body = await req.json();
    const validation = startWorkflowSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "请求参数错误",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { imageUrl, category, brand } = validation.data;

    // 创建工作流执行记录（使用测试用户 ID）
    const workflow = await prisma.workflowExecution.create({
      data: {
        userId: "test-user", // 测试用户
        imageUrl,
        category: category || null,
        brand: brand || null,
        status: "PENDING",
        currentStep: "IMAGE_DOWNLOAD",
        version: 1,
      },
    });

    // 添加任务到队列
    const job = await imageRecognitionQueue.add("recognize", {
      workflowId: workflow.id,
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      jobId: job.id,
      status: "queued",
      message: "工作流已启动，正在处理中...",
    });
  } catch (error: any) {
    console.error("[API] 启动工作流失败:", error);

    return NextResponse.json(
      {
        error: "启动失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
