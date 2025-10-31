import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getImageRecognitionQueue } from "@/lib/queues";
import { ensureConnection } from "@/lib/queues/config";
import { z } from "zod";
import { apiLogger as logger } from "@/lib/logger";

// 强制动态渲染,禁用静态生成
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30; // Vercel Serverless 函数最长执行 30 秒

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

    // 4. 确保 Redis 连接已建立
    logger.stepStart('连接 Redis', workflowId);
    try {
      await ensureConnection();
      logger.success('Redis 连接成功', { workflowId });
    } catch (redisError: any) {
      logger.error('Redis 连接失败', { workflowId, error: redisError });

      // 标记工作流为失败
      await prisma.workflowExecution.update({
        where: { id: workflow.id },
        data: {
          status: "FAILED",
          errorMessage: `Redis 连接失败: ${redisError.message}`,
        },
      });

      return NextResponse.json(
        {
          error: "工作流启动失败",
          message: "无法连接到任务队列服务,请稍后重试",
          details: process.env.VERCEL_ENV !== 'production' ? redisError.message : undefined,
        },
        { status: 503 }
      );
    }

    // 5. 加入任务队列
    logger.stepStart('添加到图片识别队列', workflowId);
    const queue = getImageRecognitionQueue();
    const job = await queue.add("recognize", {
      workflowId: workflow.id,
      imageUrl,
    });
    logger.queueEvent('图片识别任务已加入队列', workflowId, job.id);

    // 6. 返回响应
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
        type: error.constructor.name,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
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
      errorDetails.errno = error.errno;
      errorDetails.syscall = error.syscall;
      errorDetails.redisUrl = process.env.REDIS_URL ? '已配置' : '未配置';
      errorDetails.upstashUrl = process.env.UPSTASH_REDIS_REST_URL ? '已配置' : '未配置';
      errorDetails.databaseUrl = process.env.DATABASE_URL ? '已配置' : '未配置';
    }

    return NextResponse.json(errorDetails, { status: 500 });
  }
}
