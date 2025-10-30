/**
 * 工作流日志工具
 * 统一的日志格式和输出
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

interface LogOptions {
  workflowId?: string;
  jobId?: string;
  step?: string;
  data?: any;
  error?: any;
}

const LOG_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
  [LogLevel.INFO]: '\x1b[34m',    // Blue
  [LogLevel.WARN]: '\x1b[33m',    // Yellow
  [LogLevel.ERROR]: '\x1b[31m',   // Red
  [LogLevel.SUCCESS]: '\x1b[32m', // Green
};

const RESET_COLOR = '\x1b[0m';

class WorkflowLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];

    let logMessage = `${color}[${timestamp}] [${this.context}] [${level}]${RESET_COLOR} ${message}`;

    if (options?.workflowId) {
      logMessage += ` | WorkflowID: ${options.workflowId}`;
    }

    if (options?.jobId) {
      logMessage += ` | JobID: ${options.jobId}`;
    }

    if (options?.step) {
      logMessage += ` | Step: ${options.step}`;
    }

    return logMessage;
  }

  debug(message: string, options?: LogOptions) {
    console.log(this.formatMessage(LogLevel.DEBUG, message, options));
    if (options?.data) {
      console.log('  Data:', JSON.stringify(options.data, null, 2));
    }
  }

  info(message: string, options?: LogOptions) {
    console.log(this.formatMessage(LogLevel.INFO, message, options));
    if (options?.data) {
      console.log('  Data:', JSON.stringify(options.data, null, 2));
    }
  }

  warn(message: string, options?: LogOptions) {
    console.warn(this.formatMessage(LogLevel.WARN, message, options));
    if (options?.data) {
      console.warn('  Data:', JSON.stringify(options.data, null, 2));
    }
  }

  error(message: string, options?: LogOptions) {
    console.error(this.formatMessage(LogLevel.ERROR, message, options));
    if (options?.error) {
      console.error('  Error:', options.error);
      if (options.error.stack) {
        console.error('  Stack:', options.error.stack);
      }
    }
    if (options?.data) {
      console.error('  Data:', JSON.stringify(options.data, null, 2));
    }
  }

  success(message: string, options?: LogOptions) {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, options));
    if (options?.data) {
      console.log('  Data:', JSON.stringify(options.data, null, 2));
    }
  }

  // 工作流专用方法
  workflowStart(workflowId: string, data?: any) {
    this.info('🚀 工作流开始', { workflowId, data });
  }

  workflowComplete(workflowId: string, duration: number, data?: any) {
    this.success(`✅ 工作流完成 (耗时: ${duration}ms)`, { workflowId, data });
  }

  workflowError(workflowId: string, error: any, data?: any) {
    this.error('❌ 工作流失败', { workflowId, error, data });
  }

  stepStart(step: string, workflowId: string, data?: any) {
    this.info(`📍 步骤开始: ${step}`, { workflowId, step, data });
  }

  stepComplete(step: string, workflowId: string, duration: number, data?: any) {
    this.success(`✓ 步骤完成: ${step} (耗时: ${duration}ms)`, { workflowId, step, data });
  }

  stepError(step: string, workflowId: string, error: any, data?: any) {
    this.error(`✗ 步骤失败: ${step}`, { workflowId, step, error, data });
  }

  apiCall(api: string, workflowId: string, data?: any) {
    this.debug(`🔌 API 调用: ${api}`, { workflowId, data });
  }

  apiResponse(api: string, workflowId: string, duration: number, data?: any) {
    this.debug(`📥 API 响应: ${api} (耗时: ${duration}ms)`, { workflowId, data });
  }

  dbQuery(query: string, workflowId: string, data?: any) {
    this.debug(`💾 数据库操作: ${query}`, { workflowId, data });
  }

  queueEvent(event: string, workflowId: string, jobId?: string, data?: any) {
    this.debug(`📨 队列事件: ${event}`, { workflowId, jobId, data });
  }
}

// 导出常用的 logger 实例
export const imageRecognitionLogger = new WorkflowLogger('图片识别');
export const listingGenerationLogger = new WorkflowLogger('文案生成');
export const imageGenerationLogger = new WorkflowLogger('图片生成');
export const apiLogger = new WorkflowLogger('API');
export const workerLogger = new WorkflowLogger('Worker');

// 导出类供自定义使用
export { WorkflowLogger };
