import { generateProductImage } from '../lib/services/claude';

async function testImageGeneration() {
  console.log('🧪 测试完整的图片生成流程...\n');

  const testPrompt = "Based on the reference image, keep the same product, show angle 1/5 highlighting main features, white background, professional studio lighting, 4k";
  const referenceImageUrl = "https://example.com/test.jpg";

  try {
    console.log('📝 测试参数:');
    console.log('   Prompt:', testPrompt);
    console.log('   Reference Image:', referenceImageUrl);
    console.log('');

    console.log('🔄 开始生成图片...');
    const startTime = Date.now();

    const result = await generateProductImage(testPrompt, referenceImageUrl);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log('✅ 生成成功!');
    console.log('   用时:', duration, '秒');
    console.log('   图片 URL:', result.imageUrl.substring(0, 100) + '...');
    console.log('   Prompt:', result.prompt);

  } catch (error: any) {
    console.log('');
    console.error('❌ 生成失败!');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('');
    console.error('完整错误:', error);

    // 分析错误原因
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 这是网络连接错误,可能原因:');
      console.log('   1. Worker 进程的网络环境与脚本不同');
      console.log('   2. 并发请求过多导致连接池耗尽');
      console.log('   3. 某个请求超时影响后续请求');
      console.log('\n建议:');
      console.log('   - 检查 Worker 进程的网络代理设置');
      console.log('   - 降低并发数(workers/image-generation.worker.ts concurrency)');
      console.log('   - 增加请求超时时间');
    }
  }
}

testImageGeneration();
