import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // 创建测试用户
    const testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "测试用户",
        role: UserRole.USER,
        emailVerified: new Date(),
      },
    });

    console.log("✅ 测试用户创建成功!");
    console.log("📧 邮箱: test@example.com");
    console.log("🆔 用户 ID:", testUser.id);
    console.log("👤 角色:", testUser.role);
    console.log("\n💡 使用说明:");
    console.log("1. 访问 http://localhost:3000");
    console.log("2. 点击登录");
    console.log("3. 使用邮箱登录: test@example.com");
    console.log("4. 查收邮箱中的验证链接(如果配置了 Resend)");
    console.log("   或直接从数据库的 verification_tokens 表复制链接");

    // 创建管理员用户
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        name: "管理员",
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
    });

    console.log("\n✅ 管理员账户创建成功!");
    console.log("📧 邮箱: admin@example.com");
    console.log("🆔 用户 ID:", adminUser.id);
    console.log("👤 角色:", adminUser.role);
  } catch (error) {
    console.error("❌ 创建用户失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
