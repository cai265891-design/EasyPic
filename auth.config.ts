import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
// import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";
// import { sendVerificationRequest } from "@/lib/email";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // 直接授权,不显示同意页面
      allowDangerousEmailAccountLinking: true,
    }),
    // Resend 邮箱登录已改用 Supabase,这里注释掉避免显示同意页面
    // Resend({
    //   apiKey: env.RESEND_API_KEY,
    //   from: env.EMAIL_FROM,
    //   // sendVerificationRequest,
    // }),
  ],
} satisfies NextAuthConfig;
