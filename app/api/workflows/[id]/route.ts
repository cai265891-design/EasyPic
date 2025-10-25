import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 2. 查询工作流（包含所有关联数据）
    const workflow = await prisma.workflowExecution.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // 确保用户只能查看自己的工作流
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
        parent: {
          select: {
            id: true,
            version: true,
            createdAt: true,
          },
        },
        children: {
          select: {
            id: true,
            version: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            version: "desc",
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "工作流不存在" }, { status: 404 });
    }

    // 3. 计算进度百分比
    const progress = calculateProgress(workflow);

    // 4. 返回数据
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
            userRating: workflow.listing.userRating,
            userFeedback: workflow.listing.userFeedback,
          }
        : null,

      // 图片集
      images: workflow.listing?.imageSet
        ? {
            id: workflow.listing.imageSet.id,
            status: workflow.listing.imageSet.status,
            totalCost: workflow.listing.imageSet.totalCost,
            items: workflow.listing.imageSet.productImages,
          }
        : null,

      // 版本历史
      versions: {
        parent: workflow.parent,
        children: workflow.children,
      },

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

/**
 * 计算工作流进度
 */
function calculateProgress(workflow: any): number {
  if (workflow.status === "COMPLETED") return 100;
  if (workflow.status === "FAILED" || workflow.status === "CANCELLED")
    return 0;

  // 根据当前步骤计算进度
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
