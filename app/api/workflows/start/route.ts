import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { imageRecognitionQueue } from "@/lib/queues";
import { z } from "zod";

const startWorkflowSchema = z.object({
  imageUrl: z.string().url("请提供有效的图片 URL"),
  category: z.string().optional(),
  brand: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权，请先登录" },
        { status: 401 }
      );
    }

    // 2. 解析和验证请求体
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

    // 3. 创建工作流执行记录
    const workflow = await prisma.workflowExecution.create({
      data: {
        userId: session.user.id,
        imageUrl,
        category,
        brand,
        status: "PENDING",
        metadata: {
          startedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`[API] 创建工作流: ${workflow.id}, 用户: ${session.user.id}`);

    // 4. 加入任务队列
    const job = await imageRecognitionQueue.add("recognize", {
      workflowId: workflow.id,
      imageUrl,
    });

    console.log(`[API] 任务已加入队列: ${job.id}`);

    // 5. 返回响应
    return NextResponse.json(
      {
        success: true,
        workflowId: workflow.id,
        jobId: job.id,
        status: "queued",
        message: "工作流已启动，正在处理中...",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API] 启动工作流失败:", error);

    return NextResponse.json(
      {
        error: "启动工作流失败",
        message: error.message || "未知错误",
      },
      { status: 500 }
    );
  }
}
