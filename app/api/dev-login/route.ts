import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { encode } from "next-auth/jwt";

// 仅在开发环境可用
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "仅开发环境可用" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "缺少 email 参数" }, { status: 400 });
  }

  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: `用户不存在: ${email}` },
        { status: 404 }
      );
    }

    // 创建 session
    const sessionToken = randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    // 设置 cookie
    const cookieStore = cookies();

    // NextAuth 使用的 session token cookie
    cookieStore.set("next-auth.session-token", sessionToken, {
      expires,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    // 重定向到 dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error: any) {
    console.error("[DEV-LOGIN] 错误:", error);
    return NextResponse.json(
      { error: "登录失败", message: error.message },
      { status: 500 }
    );
  }
}
