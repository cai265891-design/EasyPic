import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { imageRecognitionQueue } from "@/lib/queues";
import { z } from "zod";
import { apiLogger as logger } from "@/lib/logger";

const startWorkflowSchema = z.object({
  imageUrl: z.string().url("请提供有效的图片 URL"),
  category: z.string().optional(),
  brand: z.string().optional(),
  productName: z.string().optional(),
  features: z.string().optional(),
  specifications: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let workflowId = 'unknown';

  try {
    logger.info('收到启动工作流请求', { data: { method: 'POST', path: '/api/workflows/start' } });

    // 1. 验证用户身份
    const session = await auth();

    // 临时绕过认证验证,用于测试
    const userId = session?.user?.id || 'test-user';
    logger.debug('用户认证检查', { data: { userId, hasSession: !!session } });

    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "未授权，请先登录" },
    //     { status: 401 }
    //   );
    // }

    // 2. 解析和验证请求体
    const body = await req.json();
    const validation = startWorkflowSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('请求参数验证失败', { data: { errors: validation.error.errors } });
      return NextResponse.json(
        {
          error: "请求参数错误",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { imageUrl, category, brand, productName, features, specifications } = validation.data;

    // 3. 创建工作流执行记录
    logger.stepStart('创建工作流记录', workflowId);
    const workflow = await prisma.workflowExecution.create({
      data: {
        userId: userId,
        imageUrl,
        category,
        brand,
        productName,
        features,
        specifications,
        status: "PENDING",
        metadata: {
          startedAt: new Date().toISOString(),
        },
      },
    });
    workflowId = workflow.id;
    logger.success('工作流记录已创建', { workflowId, data: { userId, category, brand } });

    // 4. 加入任务队列
    logger.stepStart('添加到图片识别队列', workflowId);
    const job = await imageRecognitionQueue.add("recognize", {
      workflowId: workflow.id,
      imageUrl,
    });
    logger.queueEvent('图片识别任务已加入队列', workflowId, job.id);

    // 5. 返回响应
    logger.success(`工作流启动成功 (耗时: ${Date.now() - startTime}ms)`, {
      workflowId,
      data: { jobId: job.id }
    });

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
    logger.error('启动工作流失败', {
      workflowId,
      error,
      data: {
        processingTime: Date.now() - startTime,
        type: error.constructor.name
      }
    });

    // 详细错误信息,帮助调试
    const errorDetails: any = {
      error: "启动工作流失败",
      message: error.message || "未知错误",
      type: error.constructor.name,
    };

    // 在开发/预览环境显示更多调试信息
    if (process.env.VERCEL_ENV !== 'production') {
      errorDetails.stack = error.stack;
      errorDetails.code = error.code;
      errorDetails.cause = error.cause;
    }

    return NextResponse.json(errorDetails, { status: 500 });
  }
}
