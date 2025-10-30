/**
 * 测试 Cloudflare R2 连接和上传功能
 *
 * 使用方法:
 * npx tsx scripts/test-r2-connection.ts
 */

import { S3Client, PutObjectCommand, ListBucketsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') });

const REQUIRED_VARS = [
  'CLOUDFLARE_R2_ACCESS_KEY',
  'CLOUDFLARE_R2_SECRET_KEY',
  'CLOUDFLARE_R2_ENDPOINT',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_PUBLIC_URL',
];

async function testR2Connection() {
  console.log('=== Cloudflare R2 连接测试 ===\n');

  // 1. 检查环境变量
  console.log('📋 步骤 1: 检查环境变量...');
  const missingVars = REQUIRED_VARS.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 缺少必需的环境变量:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n请在 .env.local 中配置这些变量');
    process.exit(1);
  }

  console.log('✅ 所有必需的环境变量已配置\n');
  console.log('配置信息:');
  console.log(`   Access Key: ${process.env.CLOUDFLARE_R2_ACCESS_KEY?.substring(0, 10)}...`);
  console.log(`   Endpoint: ${process.env.CLOUDFLARE_R2_ENDPOINT}`);
  console.log(`   Bucket: ${process.env.CLOUDFLARE_R2_BUCKET}`);
  console.log(`   Public URL: ${process.env.CLOUDFLARE_R2_PUBLIC_URL}\n`);

  // 2. 创建 S3 客户端
  console.log('📋 步骤 2: 创建 S3 客户端...');
  const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
    },
  });
  console.log('✅ S3 客户端创建成功\n');

  // 3. 测试存储桶访问
  console.log('📋 步骤 3: 测试存储桶访问...');
  try {
    await s3Client.send(new HeadBucketCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    }));
    console.log(`✅ 存储桶 "${process.env.CLOUDFLARE_R2_BUCKET}" 访问成功\n`);
  } catch (error: any) {
    console.error(`❌ 存储桶访问失败: ${error.message}`);
    console.error('请检查:');
    console.error('   1. 存储桶名称是否正确');
    console.error('   2. API 令牌是否有访问该存储桶的权限');
    process.exit(1);
  }

  // 4. 测试上传功能
  console.log('📋 步骤 4: 测试文件上传...');
  const testContent = `R2 连接测试 - ${new Date().toISOString()}`;
  const testKey = `test/connection-test-${Date.now()}.txt`;

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    }));
    console.log('✅ 文件上传成功\n');

    // 5. 生成公开访问 URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${testKey}`;
    console.log('📋 步骤 5: 公开访问 URL');
    console.log(`   ${publicUrl}\n`);

    // 6. 测试公开访问
    console.log('📋 步骤 6: 测试公开访问...');
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        const content = await response.text();
        if (content === testContent) {
          console.log('✅ 公开访问测试成功\n');
        } else {
          console.warn('⚠️  文件内容不匹配');
        }
      } else {
        console.error(`❌ 公开访问失败: ${response.status} ${response.statusText}`);
        console.error('请检查存储桶是否已启用公开访问:');
        console.error('   1. 进入 R2 存储桶设置');
        console.error('   2. 找到"公开访问"部分');
        console.error('   3. 点击"允许访问"按钮');
      }
    } catch (error: any) {
      console.error(`❌ 公开访问测试失败: ${error.message}`);
    }

    console.log('\n=== 测试完成 ===');
    console.log('✅ R2 连接和上传功能正常');
    console.log(`✅ 测试文件已上传: ${testKey}`);
    console.log('💡 提示: 你可以在 R2 控制台查看上传的测试文件\n');

  } catch (error: any) {
    console.error(`❌ 文件上传失败: ${error.message}`);
    console.error('\n错误详情:');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
testR2Connection().catch((error) => {
  console.error('\n💥 测试过程中发生未捕获的错误:');
  console.error(error);
  process.exit(1);
});
