# 测试账户登录指南

## 已创建的测试账户

1. **普通用户**
   - 邮箱: `test@example.com`
   - 角色: USER
   - 权限: 可访问 Dashboard、工作流系统、Billing 等

2. **管理员用户**
   - 邮箱: `admin@example.com`
   - 角色: ADMIN
   - 权限: 可访问所有页面,包括 Admin Panel、Orders 等

## 登录步骤

### 方法 1: 通过登录链接(推荐)

1. 启动开发服务器:
```bash
pnpm dev
```

2. 访问登录页面: http://localhost:3008/login

3. 输入邮箱(例如 `test@example.com`)并点击"Sign In with Email"

4. 在新终端窗口运行以下命令获取登录链接:
```bash
pnpm login-link test@example.com
```

5. 复制输出的登录链接并在浏览器中打开

6. 成功登录!

### 方法 2: 如果配置了 Resend 邮件服务

1. 访问登录页面并输入邮箱
2. 查收邮箱中的验证邮件
3. 点击邮件中的登录链接

## 快捷命令

```bash
# 创建新的测试用户
pnpm create-user

# 获取登录链接(默认 test@example.com)
pnpm login-link

# 获取管理员登录链接
pnpm login-link admin@example.com

# 启动 Docker 服务(PostgreSQL + Redis)
pnpm docker:dev

# 停止 Docker 服务
pnpm docker:down

# 启动开发服务器
pnpm dev

# 启动工作流 Workers
pnpm workers
```

## 完整开发环境启动流程

1. 启动 Docker 服务:
```bash
pnpm docker:dev
```

2. 启动开发服务器:
```bash
pnpm dev
```

3. (可选)启动工作流 Workers:
```bash
pnpm workers
```

4. 访问应用: http://localhost:3008

5. 获取登录链接登录系统

## 测试工作流系统

1. 登录后,访问侧边栏的"工作流系统"
2. 输入图片 URL(例如产品图片)
3. 点击"启动工作流"
4. 等待处理完成,查看识别和生成的结果

## 注意事项

- 确保 Docker 服务正在运行
- 确保 `.env.local` 中配置了正确的数据库连接
- 登录链接有效期为 24 小时
- 如需重置测试数据,运行 `pnpm create-user` 重新创建用户
