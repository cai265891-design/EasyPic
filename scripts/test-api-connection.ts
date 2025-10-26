// 测试图片生成 API 连接
async function testAPI() {
  console.log('🧪 测试图片生成 API 连接...\n');

  try {
    console.log('1️⃣  发送 POST 请求到 https://api.evolink.ai/v1/images/generations');

    const response = await fetch('https://api.evolink.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-image',
        prompt: 'A simple test image',
      }),
    });

    console.log('2️⃣  响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 返回错误:', errorText);
      return;
    }

    const data = await response.json();
    console.log('3️⃣  响应数据:', JSON.stringify(data, null, 2));

    if (data.status === 'pending' && data.id) {
      console.log('\n✅ API 连接正常!');
      console.log('   任务 ID:', data.id);
      console.log('   预计耗时:', data.task_info?.estimated_time, '秒');
    } else {
      console.log('\n⚠️  响应格式异常');
    }

  } catch (error: any) {
    console.error('\n❌ 测试失败!');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);

    // 检查常见网络错误
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 可能的原因:');
      console.log('   1. 网络连接问题(防火墙/代理)');
      console.log('   2. DNS 解析失败');
      console.log('   3. SSL 证书验证失败');
      console.log('   4. 请求超时');
    }
  }
}

testAPI();
