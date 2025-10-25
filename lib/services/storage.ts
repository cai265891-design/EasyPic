import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

// 支持 Cloudflare R2 和 AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || undefined,
  credentials: {
    accessKeyId:
      process.env.CLOUDFLARE_R2_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey:
      process.env.CLOUDFLARE_R2_SECRET_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME =
  process.env.CLOUDFLARE_R2_BUCKET || process.env.AWS_S3_BUCKET!;
const PUBLIC_URL =
  process.env.CLOUDFLARE_R2_PUBLIC_URL ||
  `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

export interface UploadImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  size: number;
}

/**
 * 上传图片到 S3/R2
 */
export async function uploadProductImage(
  imageBuffer: Buffer,
  path: string,
  options: {
    generateThumbnail?: boolean;
    resize?: { width: number; height: number };
    addWatermark?: boolean;
  } = {}
): Promise<UploadImageResult> {
  const {
    generateThumbnail = true,
    resize = { width: 2000, height: 2000 },
    addWatermark = false,
  } = options;

  // 处理主图片
  let processedImage = sharp(imageBuffer);

  // 调整大小
  processedImage = processedImage.resize(resize.width, resize.height, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  });

  // 可选：添加水印（需要水印图片）
  if (addWatermark && process.env.WATERMARK_IMAGE_PATH) {
    // TODO: 实现水印逻辑
  }

  // 转换为 JPEG
  const finalImage = await processedImage
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();

  // 上传主图片
  const imageKey = `${path}.jpg`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
      Body: finalImage,
      ContentType: "image/jpeg",
      // ACL: "public-read", // R2 不支持 ACL，使用 bucket 策略
    })
  );

  const imageUrl = `${PUBLIC_URL}/${imageKey}`;

  // 生成缩略图
  let thumbnailUrl = imageUrl;
  if (generateThumbnail) {
    const thumbnail = await sharp(imageBuffer)
      .resize(500, 500, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailKey = `${path}-thumb.jpg`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: "image/jpeg",
      })
    );

    thumbnailUrl = `${PUBLIC_URL}/${thumbnailKey}`;
  }

  return {
    imageUrl,
    thumbnailUrl,
    size: finalImage.length,
  };
}

/**
 * 下载图片
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000), // 30 秒超时
  });

  if (!response.ok) {
    throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * 验证图片格式和大小
 */
export async function validateImage(
  buffer: Buffer
): Promise<{ valid: boolean; error?: string; metadata?: sharp.Metadata }> {
  try {
    const metadata = await sharp(buffer).metadata();

    // 检查格式
    const allowedFormats = ["jpeg", "jpg", "png", "webp"];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `不支持的图片格式: ${metadata.format}。支持的格式: ${allowedFormats.join(", ")}`,
      };
    }

    // 检查大小
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return {
        valid: false,
        error: `图片过大: ${(buffer.length / 1024 / 1024).toFixed(2)}MB。最大支持 10MB`,
      };
    }

    // 检查尺寸
    if (metadata.width && metadata.height) {
      if (metadata.width < 100 || metadata.height < 100) {
        return {
          valid: false,
          error: `图片尺寸过小: ${metadata.width}x${metadata.height}。最小 100x100`,
        };
      }
    }

    return { valid: true, metadata };
  } catch (error) {
    return { valid: false, error: `图片验证失败: ${error}` };
  }
}
