import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // 如果URL中包含错误,直接重定向到登录页
  if (error) {
    console.error("Supabase callback error:", error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, request.url)
    );
  }

  // 处理 magic link (token_hash + type)
  if (token_hash && type) {
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (verifyError) {
      console.error("Supabase OTP verification error:", verifyError);
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed`, request.url)
      );
    }

    // 验证成功,重定向到目标页面
    return NextResponse.redirect(new URL(next, request.url));
  }

  // 如果没有token_hash,直接重定向(可能是旧链接或者配置问题)
  console.log("No token_hash found in callback, redirecting to dashboard");
  return NextResponse.redirect(new URL(next, request.url));
}
