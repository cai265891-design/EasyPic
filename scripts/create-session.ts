import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function createSession() {
  const email = process.argv[2] || "test@example.com";

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ 未找到用户: ${email}`);
    console.log("💡 请先运行: pnpm create-user");
    process.exit(1);
  }

  // 删除旧的会话
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  // 创建新会话(30天有效期)
  const sessionToken = randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  console.log("✅ 会话创建成功!");
  console.log(`📧 邮箱: ${email}`);
  console.log(`👤 用户名: ${user.name}`);
  console.log(`🎫 Session Token: ${sessionToken}`);
  console.log(`⏰ 过期时间: ${expires.toLocaleString("zh-CN")}`);
  console.log("\n💡 请在浏览器中手动设置 Cookie:");
  console.log("1. 访问 http://localhost:3008");
  console.log("2. 打开开发者工具(F12) -> Application/存储 -> Cookies");
  console.log(`3. 添加新 Cookie:`);
  console.log(`   Name: next-auth.session-token`);
  console.log(`   Value: ${sessionToken}`);
  console.log(`   Domain: localhost`);
  console.log(`   Path: /`);
  console.log("4. 刷新页面即可登录");

  await prisma.$disconnect();
}

createSession().catch((error) => {
  console.error("❌ 错误:", error);
  prisma.$disconnect();
  process.exit(1);
});
