import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadProductImage } from "@/lib/services/storage";

export async function POST(req: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();

    // 临时绕过认证验证,用于测试
    const userId = session?.user?.id || 'test-user';

    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "未授权，请先登录" },
    //     { status: 401 }
    //   );
    // }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "没有收到文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "只支持图片文件" },
        { status: 400 }
      );
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件大小不能超过 10MB" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${userId}_${timestamp}_${randomString}`;

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到 R2
    const uploadPath = `uploads/${userId}/${filename}`;
    const uploadResult = await uploadProductImage(buffer, uploadPath, {
      generateThumbnail: false, // 用户上传的原图不需要缩略图
      resize: { width: 2000, height: 2000 },
    });

    console.log(`[上传] 用户 ${userId} 上传文件到 R2: ${uploadPath}, 大小: ${file.size} bytes`);
    console.log(`[上传] R2 公网 URL: ${uploadResult.imageUrl}`);

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.imageUrl, // R2 公网 URL
      thumbnailUrl: uploadResult.thumbnailUrl,
      filename: `${filename}.jpg`,
      size: uploadResult.size,
    });
  } catch (error: any) {
    console.error("[上传] 失败:", error);
    return NextResponse.json(
      {
        error: "上传失败",
        message: error.message || "未知错误",
      },
      { status: 500 }
    );
  }
}
