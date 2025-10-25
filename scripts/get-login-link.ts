import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getLoginLink() {
  const email = process.argv[2] || "test@example.com";

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ 未找到用户: ${email}`);
    console.log("💡 请先运行: pnpm create-user");
    process.exit(1);
  }

  const loginUrl = `http://localhost:3008/api/dev-login?email=${encodeURIComponent(email)}`;

  console.log("✅ 开发环境登录链接已生成!");
  console.log(`📧 邮箱: ${email}`);
  console.log(`👤 用户: ${user.name || "未设置"}`);
  console.log(`👑 角色: ${user.role}`);
  console.log(`🔗 登录链接:\n\n${loginUrl}\n`);
  console.log("💡 复制上面的链接到浏览器访问,将自动登录并跳转到 Dashboard");
  console.log("⚠️  此链接仅在开发环境(NODE_ENV=development)有效");

  await prisma.$disconnect();
}

getLoginLink().catch((error) => {
  console.error("❌ 错误:", error);
  prisma.$disconnect();
  process.exit(1);
});
