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
  image_prompts?: string[]; // 5 个图片生成提示词
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
              text: `You are a professional e-commerce visual recognition analyst.

Carefully observe the physical product itself in the image, and—based on your understanding of its appearance—sensibly reference functional cue elements shown in the image (e.g., lights, buttons, musical notes, motion/speed lines, text labels). If these cues imply functionality or usage, make reasonable inferences.

Please output the following fields:
{
“Product Type”: “Clearly state what kind of product this is (e.g., toy car, drone, headphones, pet toy, etc.)”,
“Materials & Colors”: “Describe the primary materials (e.g., plastic, metal) and the main color palette”,
“Functional Cues”: “Functions that can be inferred from the image or visual elements, such as lighting, sound, rechargeable battery, movable parts, etc.”,
“Interactive Features”: “If possible, infer likely interactivity or play modes, such as follow mode, drifting, obstacle avoidance, pet interaction, etc.”,
“Use Scenarios”: “Based on the appearance, infer suitable scenarios (e.g., children’s play, pet entertainment, home leisure, etc.)”,
“Target Audience”: “Infer the primary target users (e.g., children, pet owners, household users, etc.)”
}

Important notes:
1. You may reference functional text or icons in the image (e.g., “lighting effects,” “Speed Way,” musical notes), but do not quote the ad copy verbatim.
2. The output must be based on the image itself and reasonable inference; do not fabricate.
3. Use concise, professional Chinese, with no more than 200 Chinese characters.`,
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
  productName?: string;
  features?: string;
  specifications?: string;
  targetMarket?: string;
  tone?: string;
  emphasize?: string[];
  userFeedback?: string;
}): Promise<ListingContent> {
  const {
    productDescription,
    category = "General",
    brand = "[品牌名]",
    productName,
    features,
    specifications,
    targetMarket = "US",
    tone = "professional",
    emphasize = [],
    userFeedback,
  } = params;

  const systemPrompt = `You are an Amazon top-rated seller’s listing optimization expert.

Task: Based on the input below, generate professional Amazon Listing content (title + description + bullet_points + keywords + image_prompts).

Input:
目标市场：${targetMarket}
商品类别：${category}
品牌：${brand}
${productName ? `商品名称：${productName}` : ""}
${features ? `核心特点：${features}` : ""}
${specifications ? `商品规格：${specifications}` : ""}
语气：${tone}
${emphasize.length > 0 ? `重点强调：${emphasize.join(", ")}` : ""}
${userFeedback ? `用户反馈：${userFeedback}` : ""}

## Task Requirements

1. Perform function & experience inference before generating:
- If keywords such as “lights,” “sound effects,” “sensor,” or “remote control” are detected → infer interactive or smart experiences.
- If the category is “toy car,” “RC Car,” or “Smart Car” → extend to driving, drifting, chasing, obstacle avoidance, etc.
- If features mention “pets,” “family,” or “children” → extend to companionship, entertainment, and parent-child interaction scenarios.
- If specs include “battery” or “USB charging” → derive “rechargeable,” “eco-friendly,” and “portable” selling points.
- If there are design highlights (e.g., rounded form, LEDs, cute style) → emphasize visual appeal and a sense of safety.
2. Language & Style:
- Use idiomatic American English.
- The tone should be evocative and vivid.
- Help buyers imagine real usage scenarios.
- Avoid parameter dumping; tell a story.
3. Structure & Format: You must output the following JSON structure exactly (all fields required; do not add explanatory text):
{
“title”: “An Amazon title of 150–200 characters including the brand name (${brand}), core keywords, and main feature set.”,
“description”: “A detailed description of 250–350 characters. Split into 3–4 paragraphs covering emotional experience, key features, usage scenarios, and quality assurance. Smooth, rhythmic language.”,
“bullet_points”: [
“[Selling Point 1 Title] 30–50 words explaining the value, e.g., 3 Smart Interactive Modes - Drive, Follow, and Escape!”,
“[Selling Point 2 Title] 30–50 words highlighting materials or performance, e.g., Durable 4WD Design for Smooth 360° Drift Performance”,
“[Selling Point 3 Title] 30–50 words tied to scenarios, e.g., Fun for Kids and Pets - Perfect for Indoor Play”,
“[Selling Point 4 Title] 30–50 words on design or emotional highlights, e.g., Cute Round Look with LED Lights & Sound Effects”,
“[Selling Point 5 Title] 30–50 words on after-sales or added value, e.g., Rechargeable Battery with USB Cable Included”
],
“keywords”: [“keyword 1”, “keyword 2”, “keyword 3”, “keyword 4”, “keyword 5”],
“image_prompts”: [
“Based on the reference image, keep the same product. Professional product photography demonstrating [core feature of Selling Point 1]. Scene description: e.g., ‘car following a moving object in follow mode with motion trails’. White studio background, professional lighting, 4K resolution.”,
“Based on the reference image, keep the same product. Professional product photography demonstrating [core feature of Selling Point 2]. Scene description: e.g., ‘car performing a 360-degree drift on smooth surface’. White studio background, professional lighting, 4K resolution.”,
“Based on the reference image, keep the same product. Professional product photography demonstrating [core feature of Selling Point 3]. Scene description: e.g., ‘car playing with a cat or child in living room scene’. Clean background, natural lighting, 4K resolution.”,
“Based on the reference image, keep the same product. Professional product photography highlighting [core feature of Selling Point 4]. Scene description: e.g., ‘close-up of LED headlights glowing with cute design visible’. White studio background, dramatic lighting, 4K resolution.”,
“Based on the reference image, keep the same product. Professional product photography showing [core feature of Selling Point 5]. Scene description: e.g., ‘USB charging setup with cable connected, ready to play’. White studio background, clean composition, 4K resolution.”
]
}
## Additional Instructions
- Output JSON only; do not add explanatory text.
- All content must be original.
- The model should automatically infer reasonable attributes not explicitly stated (e.g., suitable age range, interaction modes).
- Keep all fields complete (including five items each for keywords and image_prompts).`;

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

  console.log(`[generateListing] AI返回的字段:`, {
    has_title: !!listing.title,
    has_bullet_points: !!listing.bullet_points,
    has_keywords: !!listing.keywords,
    has_image_prompts: !!listing.image_prompts,
    image_prompts_count: listing.image_prompts?.length || 0,
  });

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
  prompt: string,
  referenceImageUrl?: string
): Promise<ImageGenerationResult> {
  // 构建请求体
  const requestBody: any = {
    model: "gemini-2.5-flash-image",
    prompt,
  };

  // 如果提供了参考图片,添加到请求中(使用 image_urls 数组格式)
  // 注意:只有当 URL 是公网可访问时才添加
  if (referenceImageUrl && referenceImageUrl.startsWith('http')) {
    // 确保不是 localhost 地址
    if (!referenceImageUrl.includes('localhost') && !referenceImageUrl.includes('127.0.0.1')) {
      requestBody.image_urls = [referenceImageUrl];
      console.log(`[图片生成] 使用参考图片: ${referenceImageUrl.substring(0, 80)}...`);
    } else {
      console.warn(`[图片生成] 跳过本地参考图片: ${referenceImageUrl}`);
    }
  }

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
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[图片生成] API 请求失败:", response.status, response.statusText);
    console.error("[图片生成] 错误响应体:", errorBody);
    throw new Error(
      `图片生成 API 请求失败: ${response.status} ${response.statusText} - ${errorBody.substring(0, 200)}`
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
        // 优先从 results 数组中获取图片 URL,支持多种返回格式
        const imageUrl =
          statusData.results?.[0] ||
          statusData.data?.[0]?.url ||
          statusData.data?.[0]?.image_url ||
          statusData.url ||
          statusData.image_url;

        if (!imageUrl) {
          console.error("[图片生成] API 返回完成状态但未找到图片 URL");
          console.error("[图片生成] 完整响应数据:", JSON.stringify(statusData, null, 2));
          console.error("[图片生成] 尝试过的字段: results[0], data[0].url, data[0].image_url, url, image_url");
          throw new Error("图片生成完成但未返回图片 URL,请检查 API 响应格式");
        }

        // 验证 URL 格式
        if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          console.error("[图片生成] 返回的 imageUrl 格式无效:", imageUrl);
          throw new Error(`返回的图片 URL 格式无效: ${imageUrl}`);
        }

        console.log(`[图片生成] 任务完成: ${taskId}, 用时 ${attempts * 2} 秒`);
        console.log(`[图片生成] 图片 URL: ${imageUrl}`);
        return {
          imageUrl,
          prompt,
          revisedPrompt: statusData.data?.[0]?.revised_prompt || statusData.revised_prompt,
        };
      }

      // 任务失败
      if (statusData.status === "failed") {
        const errorMsg = typeof statusData.error === 'object'
          ? JSON.stringify(statusData.error)
          : (statusData.error || "未知错误");
        throw new Error(`图片生成任务失败: ${errorMsg}`);
      }

      console.log(`[图片生成] 任务进行中... (${attempts}/${maxAttempts})`);
    }

    throw new Error("图片生成超时,请稍后重试");
  }

  // 如果直接返回图片 URL (同步模式)
  const imageUrl =
    taskData.results?.[0] ||
    taskData.data?.[0]?.url ||
    taskData.data?.[0]?.image_url ||
    taskData.url ||
    taskData.image_url;

  if (!imageUrl) {
    console.error("[图片生成] API 同步响应未找到图片 URL");
    console.error("[图片生成] 完整响应数据:", JSON.stringify(taskData, null, 2));
    throw new Error("图片生成 API 未返回图片 URL,请检查 API 响应格式");
  }

  // 验证 URL 格式
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    console.error("[图片生成] 返回的 imageUrl 格式无效:", imageUrl);
    throw new Error(`返回的图片 URL 格式无效: ${imageUrl}`);
  }

  console.log(`[图片生成] 同步模式完成,图片 URL: ${imageUrl}`);
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
  referenceImageUrl?: string; // 添加参考图片 URL
}): Promise<ImageGenerationResult[]> {
  const { productDescription, bulletPoints, brand = "", style = "professional product photography", referenceImageUrl } = params;

  const prompts = bulletPoints.slice(0, 5).map((bulletPoint, index) => {
    // 提取卖点核心内容（去除中文标题）
    const cleanedBulletPoint = bulletPoint
      .replace(/【[^】]+】/g, "")
      .trim()
      .substring(0, 100);

    // 如果有参考图片,明确指示保留原图主体
    const basePrompt = referenceImageUrl
      ? `Based on the reference image, create a professional product photography. Keep the same product from the reference image, but show it from angle ${index + 1}/5. ${style}, ${brand ? `${brand} brand, ` : ""}highlighting: ${cleanedBulletPoint}. Professional studio lighting, white background, high quality, 4k`
      : `${style}, ${brand ? `${brand} brand, ` : ""}${productDescription.substring(0, 50)}, highlighting: ${cleanedBulletPoint}. Professional studio lighting, white background, high quality, 4k, product showcase angle ${index + 1}/5`;

    return basePrompt;
  });

  // 并发生成 5 张图片,传入参考图片
  const results = await Promise.all(
    prompts.map((prompt) =>
      claudeCircuitBreaker.call(() => generateProductImage(prompt, referenceImageUrl))
    )
  );

  return results;
}
