/**
 * 数据库连接 URL 验证和修复工具
 * 处理常见的连接字符串格式问题
 */

/**
 * 验证和修复 PostgreSQL 连接 URL
 * 主要处理:
 * 1. IPv6 地址格式 (确保用方括号包裹)
 * 2. 密码中的特殊字符转义
 * 3. URL 格式验证
 */
export function sanitizeDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('DATABASE_URL 未设置');
  }

  let sanitized = url.trim();

  // 检测占位符格式 (Railway 模板)
  if (sanitized.includes('[user]') || sanitized.includes('[neon_hostname]') || sanitized.includes('[dbname]')) {
    throw new Error(
      'DATABASE_URL 是占位符格式,未正确配置!\n' +
      '请在 Railway 环境变量中设置真实的数据库连接字符串。\n' +
      '提示: 如果使用 Railway PostgreSQL 插件,应该会自动生成真实的 DATABASE_URL。'
    );
  }

  // 1. 修复 IPv6 地址格式
  // 匹配格式: postgresql://user:pass@2001:db8::1:5432/db
  // 修复为: postgresql://user:pass@[2001:db8::1]:5432/db
  const ipv6WithoutBracketsRegex = /^(postgresql:\/\/[^@]+@)([0-9a-f:]+):(\d+)(\/.*)?$/i;

  if (ipv6WithoutBracketsRegex.test(sanitized)) {
    sanitized = sanitized.replace(ipv6WithoutBracketsRegex, (match, prefix, host, port, suffix) => {
      // 检测是否是 IPv6 地址 (包含多个冒号)
      if ((host.match(/:/g) || []).length > 1) {
        console.log(`🔧 检测到未括起的 IPv6 地址,自动修复: ${host} → [${host}]`);
        return `${prefix}[${host}]:${port}${suffix || ''}`;
      }
      return match;
    });
  }

  // 2. 验证基本格式 (支持 postgres:// 和 postgresql://)
  const postgresUrlRegex = /^postgres(ql)?:\/\/.+@.+:\d+\/.+$/i;
  if (!postgresUrlRegex.test(sanitized)) {
    console.warn('⚠️  DATABASE_URL 格式可能不正确:', sanitized.replace(/:[^:]+@/, ':***@'));
  }

  // 3. 检测密码中的特殊字符 (提示用户但不自动修复)
  const passwordMatch = sanitized.match(/postgres(ql)?:\/\/[^:]+:([^@]+)@/);
  if (passwordMatch && passwordMatch[2]) {
    const password = passwordMatch[2];
    const specialChars = ['@', ':', '/', '?', '#', '[', ']'];
    const hasSpecialChar = specialChars.some(char => password.includes(char));

    if (hasSpecialChar && !password.includes('%')) {
      console.warn('⚠️  密码包含特殊字符但未 URL 编码,可能导致连接失败');
      console.warn('⚠️  请确保特殊字符已正确转义 (例: @ → %40, : → %3A)');
    }
  }

  return sanitized;
}

/**
 * 验证数据库 URL 连接性
 * 返回详细的诊断信息
 */
export function validateDatabaseUrl(url: string): {
  valid: boolean;
  protocol?: string;
  host?: string;
  port?: string;
  database?: string;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const sanitized = sanitizeDatabaseUrl(url);

    // 解析 URL 组件 (支持 postgres:// 和 postgresql://)
    const urlMatch = sanitized.match(
      /^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@(\[?[^\]]+\]?):(\d+)\/(.+)$/i
    );

    if (!urlMatch) {
      errors.push('无法解析数据库 URL 格式');
      return { valid: false, errors, warnings };
    }

    const [, protocol, username, password, host, port, database] = urlMatch;

    // 检查协议 (postgres 和 postgresql 都是有效的)
    const normalizedProtocol = protocol.toLowerCase();
    if (normalizedProtocol !== 'postgresql' && normalizedProtocol !== 'postgres') {
      warnings.push(`协议应为 postgres 或 postgresql,当前为: ${protocol}`);
    }

    // 检查端口
    const portNum = parseInt(port, 10);
    if (portNum < 1 || portNum > 65535) {
      errors.push(`端口号无效: ${port}`);
    }

    // 检查 IPv6 地址格式
    if (host.includes(':') && !host.startsWith('[')) {
      errors.push('IPv6 地址必须用方括号包裹');
    }

    // 检查数据库名
    if (!database || database.trim() === '') {
      errors.push('数据库名不能为空');
    }

    return {
      valid: errors.length === 0,
      protocol,
      host: host.replace(/[\[\]]/g, ''), // 去除方括号显示
      port,
      database,
      errors,
      warnings,
    };
  } catch (error: any) {
    errors.push(error.message || String(error));
    return { valid: false, errors, warnings };
  }
}

/**
 * 打印数据库 URL 诊断信息
 */
export function printDatabaseUrlDiagnostics(url: string | undefined): void {
  console.log('\n📊 数据库连接 URL 诊断\n' + '='.repeat(50));

  if (!url) {
    console.error('❌ DATABASE_URL 未设置');
    return;
  }

  // 隐藏密码部分
  const maskedUrl = url.replace(/:[^:]+@/, ':***@');
  console.log(`原始 URL: ${maskedUrl}`);

  try {
    const sanitized = sanitizeDatabaseUrl(url);
    const maskedSanitized = sanitized.replace(/:[^:]+@/, ':***@');

    if (sanitized !== url) {
      console.log(`修复后:   ${maskedSanitized}`);
    }

    const validation = validateDatabaseUrl(url);

    if (validation.valid) {
      console.log('\n✅ URL 格式验证通过');
      console.log(`   协议:   ${validation.protocol}`);
      console.log(`   主机:   ${validation.host}`);
      console.log(`   端口:   ${validation.port}`);
      console.log(`   数据库: ${validation.database}`);
    } else {
      console.log('\n❌ URL 格式验证失败');
    }

    if (validation.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      validation.warnings.forEach(w => console.log(`   - ${w}`));
    }

    if (validation.errors.length > 0) {
      console.log('\n❌ 错误:');
      validation.errors.forEach(e => console.log(`   - ${e}`));
    }
  } catch (error: any) {
    console.error(`\n❌ 诊断失败: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}
