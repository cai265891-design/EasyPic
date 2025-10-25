import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 测试用 API - 无需登录
 * GET /api/workflows-test/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 查询工作流（包含所有关联数据）
    const workflow = await prisma.workflowExecution.findUnique({
      where: {
        id: params.id,
      },
      include: {
        product: true,
        listing: {
          include: {
            imageSet: {
              include: {
                productImages: {
                  where: { isActive: true },
                  orderBy: { index: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "工作流不存在" }, { status: 404 });
    }

    // 计算进度百分比
    const progress = calculateProgress(workflow);

    // 返回数据
    return NextResponse.json({
      id: workflow.id,
      status: workflow.status,
      currentStep: workflow.currentStep,
      progress,
      version: workflow.version,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,

      // 输入数据
      input: {
        imageUrl: workflow.imageUrl,
        category: workflow.category,
        brand: workflow.brand,
      },

      // 商品描述
      product: workflow.product
        ? {
            id: workflow.product.id,
            description: workflow.product.description,
            keywords: workflow.product.keywords,
            confidence: workflow.product.confidence,
          }
        : null,

      // Listing 文案
      listing: workflow.listing
        ? {
            id: workflow.listing.id,
            title: workflow.listing.title,
            description: workflow.listing.description,
            bulletPoints: workflow.listing.bulletPoints,
            keywords: workflow.listing.keywords,
            qualityScore: workflow.listing.qualityScore,
            approved: workflow.listing.approved,
          }
        : null,

      // 图片集
      images: workflow.listing?.imageSet
        ? {
            id: workflow.listing.imageSet.id,
            status: workflow.listing.imageSet.status,
            items: workflow.listing.imageSet.productImages,
          }
        : null,

      // 元数据
      metadata: workflow.metadata,
      error: workflow.error,
    });
  } catch (error: any) {
    console.error("[API] 查询工作流失败:", error);

    return NextResponse.json(
      {
        error: "查询失败",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function calculateProgress(workflow: any): number {
  if (workflow.status === "COMPLETED") return 100;
  if (workflow.status === "FAILED" || workflow.status === "CANCELLED")
    return 0;

  switch (workflow.currentStep) {
    case "IMAGE_DOWNLOAD":
      return 10;
    case "IMAGE_RECOGNITION":
      return 30;
    case "LISTING_GENERATION":
      return 60;
    case "IMAGE_SET_GENERATION":
      return 85;
    default:
      return 5;
  }
}
