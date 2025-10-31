"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";
import { createClient } from "@/lib/supabase/client";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      console.log("开始 Supabase 邮箱登录...", data.email);

      const { error } = await supabase.auth.signInWithOtp({
        email: data.email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${searchParams?.get("from") || "/dashboard"}`,
        },
      });

      if (error) {
        console.error("Supabase 登录错误:", error);
        setIsLoading(false);

        // 检查是否是速率限制错误
        if (error.message.includes("request this after")) {
          const match = error.message.match(/after (\d+) seconds/);
          const seconds = match ? match[1] : "60";
          return toast.error("请求过于频繁", {
            description: `为了安全,请等待 ${seconds} 秒后再试。或者使用不同的邮箱地址。`,
            duration: 5000,
          });
        }

        return toast.error("登录失败", {
          description: error.message,
        });
      }

      console.log("登录邮件已发送");
      setIsLoading(false);
      return toast.success("查看您的邮箱", {
        description: "我们已向您发送了登录链接,请检查您的邮箱(包括垃圾邮件文件夹)",
      });
    } catch (error) {
      console.error("登录异常:", error);
      setIsLoading(false);
      return toast.error("发生错误", {
        description: "登录请求失败,请重试",
      });
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", {
        callbackUrl: searchParams?.get("from") || "/dashboard",
      });
    } catch (error) {
      console.error("Google 登录错误:", error);
      toast.error("登录失败", {
        description: "Google 登录失败,请重试",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading || isGoogleLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {type === "register" ? "使用邮箱注册" : "使用邮箱登录"}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            或者
          </span>
        </div>
      </div>

      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}
        使用 Google 登录
      </button>
    </div>
  );
}
