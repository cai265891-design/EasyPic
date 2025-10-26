/**
 * 测试图片生成 API 是否支持参考图片
 */
async function testImageGeneration() {
  const testImageUrl = "http://localhost:3008/uploads/test-user_1761446454985_2m8snn.jpg";
  const prompt = "Professional Amazon product photography, black toy car, white background, high quality, 4k";

  console.log("测试 1: 不带参考图片");
  const response1 = await fetch("https://api.evolink.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: "Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash-image",
      prompt,
    }),
  });

  const data1 = await response1.json();
  console.log("响应 1:", JSON.stringify(data1, null, 2));

  console.log("\n测试 2: 带参考图片 (参数名: image)");
  const response2 = await fetch("https://api.evolink.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: "Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash-image",
      prompt,
      image: testImageUrl,
    }),
  });

  const data2 = await response2.json();
  console.log("响应 2:", JSON.stringify(data2, null, 2));

  console.log("\n测试 3: 带参考图片 (参数名: reference_image)");
  const response3 = await fetch("https://api.evolink.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: "Bearer sk-7VXGPwxOk1Q14rICkASMS1IZcDF1lP5GJRqent9cjCQr3K73",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash-image",
      prompt,
      reference_image: testImageUrl,
    }),
  });

  const data3 = await response3.json();
  console.log("响应 3:", JSON.stringify(data3, null, 2));
}

testImageGeneration().catch(console.error);
