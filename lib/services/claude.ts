import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface VisionAnalysisResult {
  text: string;
  keywords: string[];
  confidence: number;
}

export interface ListingContent {
  title: string;
  description: string;
  bullet_points: string[];
  keywords: string[];
}

/**
 * 使用 GPT-4o Vision 分析商品图片
 */
export async function analyzeProductImage(
  imageBuffer: Buffer,
  _imageUrl: string
): Promise<VisionAnalysisResult> {
  // 压缩图片并转换为 base64(限制大小以避免API超时)
  const sharp = require('sharp');
  const compressedBuffer = await sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const base64Image = compressedBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  console.log(`[图片识别] 原始大小: ${imageBuffer.length} bytes, 压缩后: ${compressedBuffer.length} bytes`);

  const response = await fetch("https://shuchong.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer sk-aPpevMSduqTbPvAa7VxFSpzyzwEnHUWVW3qw1QlccmtXArHo",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `你是专业的电商产品分析师。请仔细观察图片中的**实物商品本身**，忽略图片上的文字、背景装饰等营销元素。

请识别并描述商品的主体信息，包括：
- **商品类型**: 这是什么产品？(例如：玩具车、文具、电子产品等)
- **材质颜色**: 商品的主要材质和颜色
- **关键特征**: 商品的核心功能和设计特点
- **使用场景**: 适合在什么场合使用
- **目标用户**: 主要面向哪类人群

重要提示：
1. 专注于识别图片中的**实际物品**，不要被文字描述误导
2. 如果看到玩具车就说玩具车，看到文具就说文具，实事求是
3. 用简洁专业的中文输出，不超过 200 字

请开始分析：`,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,  // 使用 base64 data URL
              },
            },
          ],
        },
      ],
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`图片识别 API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";

  if (!text) {
    throw new Error("图片识别 API 返回内容为空");
  }

  // 简单关键词提取
  const keywords = extractKeywords(text);
  const confidence = calculateConfidence(text, keywords);

  return {
    text,
    keywords,
    confidence,
  };
}

/**
 * 生成亚马逊 Listing 文案
 */
export async function generateListing(params: {
  productDescription: string;
  imageBuffer: Buffer;
  category?: string;
  brand?: string;
  targetMarket?: string;
  tone?: string;
  emphasize?: string[];
  userFeedback?: string;
}): Promise<ListingContent> {
  const {
    productDescription,
    category = "General",
    brand = "[品牌名]",
    targetMarket = "US",
    tone = "professional",
    emphasize = [],
    userFeedback,
  } = params;

  const systemPrompt = `你是亚马逊金牌卖家的 listing 优化专家。

任务：基于商品描述，创建专业的亚马逊 listing 内容。
目标市场：${targetMarket}
商品类别：${category}
品牌：${brand}
语气：${tone}
${emphasize.length > 0 ? `重点强调：${emphasize.join(", ")}` : ""}
${userFeedback ? `用户反馈：${userFeedback}` : ""}

输出 JSON 格式：
{
  "title": "150-200 字符的商品标题，包含品牌+核心关键词+主要特征",
  "description": "250-350 字的详细描述，分 3-4 段说明产品价值、功能、使用方法、品质承诺",
  "bullet_points": [
    "【卖点 1 标题】详细说明 30-50 字，突出核心功能",
    "【卖点 2 标题】详细说明 30-50 字，强调材质质量",
    "【卖点 3 标题】详细说明 30-50 字，描述使用场景",
    "【卖点 4 标题】详细说明 30-50 字，展示独特优势",
    "【卖点 5 标题】详细说明 30-50 字，承诺售后服务"
  ],
  "keywords": ["关键词1", "关键词2", ...]
}

要求：
- 使用地道美式英语
- 符合亚马逊内容政策（不能有夸大宣传、禁用词）
- 突出产品 USP（独特卖点）
- 自然融入 SEO 关键词
- 严格按 JSON 格式输出，不要有其他说明文字`;

  const response = await fetch("https://shuchong.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer sk-aPpevMSduqTbPvAa7VxFSpzyzwEnHUWVW3qw1QlccmtXArHo",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `商品信息：\n${productDescription}\n\n请生成亚马逊 listing，严格按 JSON 格式输出。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `文案生成 API 请求失败: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content || "";

  if (!responseText) {
    throw new Error("文案生成 API 返回内容为空");
  }

  // 解析 JSON 响应
  const listing = parseListingResponse(responseText);

  return listing;
}

/**
 * 从文本中提取关键词
 */
function extractKeywords(text: string): string[] {
  // 移除标点符号，提取中英文单词
  const words = text.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || [];

  // 停用词列表
  const stopWords = [
    "这是",
    "商品",
    "产品",
    "一款",
    "采用",
    "包括",
    "可以",
    "the",
    "is",
    "and",
    "or",
    "with",
  ];

  // 过滤并去重
  const keywords = words
    .filter((w) => !stopWords.includes(w.toLowerCase()))
    .filter((word, index, self) => self.indexOf(word) === index)
    .slice(0, 10);

  return keywords;
}

/**
 * 计算置信度分数
 */
function calculateConfidence(text: string, keywords: string[]): number {
  let score = 0.5; // 基础分数

  // 根据描述长度调整
  if (text.length > 100) score += 0.2;
  if (text.length > 150) score += 0.1;

  // 根据关键词数量调整
  if (keywords.length >= 5) score += 0.1;
  if (keywords.length >= 8) score += 0.1;

  return Math.min(score, 1.0);
}

/**
 * 解析 Listing 响应（支持多种格式）
 */
function parseListingResponse(responseText: string): ListingContent {
  let jsonContent = responseText;

  // 尝试提取 JSON 代码块
  const jsonMatch =
    responseText.match(/```json\s*([\s\S]*?)```/) ||
    responseText.match(/```\s*([\s\S]*?)```/) ||
    responseText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    jsonContent = jsonMatch[1] || jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonContent.trim()) as ListingContent;

    // 验证必需字段
    if (!parsed.title || !parsed.description || !parsed.bullet_points) {
      throw new Error("缺少必需字段");
    }

    if (
      !Array.isArray(parsed.bullet_points) ||
      parsed.bullet_points.length !== 5
    ) {
      throw new Error(
        `需要 5 个卖点，当前有 ${parsed.bullet_points?.length || 0} 个`
      );
    }

    return parsed;
  } catch (error) {
    console.error("解析 Listing 响应失败:", error);
    console.error("原始响应:", responseText);
    throw new Error(`解析 AI 响应失败: ${error}`);
  }
}

/**
 * 熔断器类
 */
class CircuitBreaker {
  private failures = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private nextRetry = Date.now();
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 分钟

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextRetry) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = "OPEN";
      this.nextRetry = Date.now() + this.timeout;
      console.warn(
        `Circuit breaker opened after ${this.failures} failures. Retry at ${new Date(this.nextRetry).toISOString()}`
      );
    }
  }
}

export const claudeCircuitBreaker = new CircuitBreaker();

/**
 * 图片生成结果
 */
export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
}

/**
 * 使用 Gemini 2.5 Flash 生成商品图片
 */
export async function generateProductImage(
  prompt: string
): Promise<ImageGenerationResult> {
  // 提交图片生成任务
  const response = await fetch(
    "https://api.evolink.ai/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization:
          "Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-image",
        prompt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `图片生成 API 请求失败: ${response.status} ${response.statusText}`
    );
  }

  const taskData = await response.json();

  // 如果返回的是异步任务,需要轮询获取结果
  if (taskData.status === "pending" && taskData.id) {
    const taskId = taskData.id;
    const maxAttempts = 60; // 最多等待 60 次 (约 2 分钟)
    let attempts = 0;

    console.log(`[图片生成] 任务已提交: ${taskId}, 预计需要 ${taskData.task_info?.estimated_time || 40} 秒`);

    while (attempts < maxAttempts) {
      // 等待 2 秒再查询
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;

      // 查询任务状态
      const statusResponse = await fetch(
        `https://api.evolink.ai/v1/tasks/${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`查询任务状态失败: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      // 任务完成
      if (statusData.status === "completed" || statusData.status === "succeeded") {
        // 优先从 results 数组中获取图片 URL
        const imageUrl = statusData.results?.[0] || statusData.data?.[0]?.url || statusData.url || statusData.image_url;
        if (!imageUrl) {
          console.error("图片生成完成但未返回 URL:", JSON.stringify(statusData, null, 2));
          throw new Error("图片生成完成但未返回图片 URL");
        }

        console.log(`[图片生成] 任务完成: ${taskId}, 用时 ${attempts * 2} 秒`);
        return {
          imageUrl,
          prompt,
          revisedPrompt: statusData.data?.[0]?.revised_prompt || statusData.revised_prompt,
        };
      }

      // 任务失败
      if (statusData.status === "failed") {
        throw new Error(`图片生成任务失败: ${statusData.error || "未知错误"}`);
      }

      console.log(`[图片生成] 任务进行中... (${attempts}/${maxAttempts})`);
    }

    throw new Error("图片生成超时,请稍后重试");
  }

  // 如果直接返回图片 URL (同步模式)
  const imageUrl = taskData.results?.[0] || taskData.data?.[0]?.url || taskData.url || taskData.image_url;

  if (!imageUrl) {
    console.error("图片生成 API 响应:", JSON.stringify(taskData, null, 2));
    throw new Error("图片生成 API 未返回图片 URL");
  }

  return {
    imageUrl,
    prompt,
    revisedPrompt: taskData.data?.[0]?.revised_prompt || taskData.revised_prompt,
  };
}

/**
 * 批量生成商品图片（基于卖点）
 */
export async function generateProductImages(params: {
  productDescription: string;
  bulletPoints: string[];
  brand?: string;
  style?: string;
}): Promise<ImageGenerationResult[]> {
  const { productDescription, bulletPoints, brand = "", style = "professional product photography" } = params;

  const prompts = bulletPoints.slice(0, 5).map((bulletPoint, index) => {
    // 提取卖点核心内容（去除中文标题）
    const cleanedBulletPoint = bulletPoint
      .replace(/【[^】]+】/g, "")
      .trim()
      .substring(0, 100);

    return `${style}, ${brand ? `${brand} brand, ` : ""}${productDescription.substring(0, 50)}, highlighting: ${cleanedBulletPoint}. Professional studio lighting, white background, high quality, 4k, product showcase angle ${index + 1}/5`;
  });

  // 并发生成 5 张图片
  const results = await Promise.all(
    prompts.map((prompt) =>
      claudeCircuitBreaker.call(() => generateProductImage(prompt))
    )
  );

  return results;
}
