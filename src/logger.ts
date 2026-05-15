/**
 * 日志工具模块
 *
 * 封装 OpenCode 的 client.app.log() API，提供结构化日志接口。
 * 当 app.log 不可用或调用失败时，自动降级到 console.error 输出，
 * 确保插件在任何运行环境下都能产生有用的日志信息。
 */

/** 默认的日志服务名称，在 OpenCode 日志面板中用于过滤 */
export const LOG_SERVICE = "thinking-translater"
/** 日志级别类型 */
export type LogLevel = "debug" | "info" | "warn" | "error"

/**
 * 结构化日志接口
 *
 * 提供带级别和额外结构化数据的日志记录能力，
 * 以及通过 child() 方法创建子日志器以区分不同子模块的能力。
 */
export interface Logger {
  debug(msg: string, extra?: Record<string, unknown>): void
  info(msg: string, extra?: Record<string, unknown>): void
  warn(msg: string, extra?: Record<string, unknown>): void
  error(msg: string, extra?: Record<string, unknown>): void
  /** 创建继承父日志器的子日志器，service 名称以斜杠层级区分 */
  child(service: string): Logger
}

/** OpenCode app.log API 的输入参数格式 */
type AppLogInput = {
  body: {
    service: string
    level: LogLevel
    message: string
    extra?: Record<string, unknown>
  }
}

/** OpenCode app.log 的方法签名 */
type AppLogMethod = (input: AppLogInput) => Promise<unknown>

/**
 * 降级输出：当 app.log 不可用或失败时，使用 stderr 输出日志
 */
function fallbackWrite(service: string, level: LogLevel, msg: string, extra?: Record<string, unknown>): void {
  const tag = `[${service}] ${level.toUpperCase()}`
  if (extra && Object.keys(extra).length > 0) {
    console.error(`${tag} ${msg}`, JSON.stringify(extra))
  } else {
    console.error(`${tag} ${msg}`)
  }
}

/**
 * 创建 Logger 实例
 *
 * 优先使用 OpenCode 提供的 app.log API 进行结构化日志记录，
 * 当 appLog 参数为空或异步调用失败时自动降级到 console.error。
 *
 * @param appLog - OpenCode 的 app.log 方法，通常来自 client.app.log
 * @param service - 日志来源标识，用于在日志面板中区分不同插件
 * @returns Logger 实例
 */
export function createLogger(
  appLog: AppLogMethod | undefined,
  service: string = LOG_SERVICE,
): Logger {
  function log(level: LogLevel, msg: string, extra?: Record<string, unknown>) {
    const body: AppLogInput["body"] = { service, level, message: msg, extra }

    if (appLog) {
      appLog({ body }).catch(() => {
        fallbackWrite(service, level, msg, extra)
      })
    } else {
      fallbackWrite(service, level, msg, extra)
    }
  }

  return {
    debug: (msg, extra) => log("debug", msg, extra),
    info: (msg, extra) => log("info", msg, extra),
    warn: (msg, extra) => log("warn", msg, extra),
    error: (msg, extra) => log("error", msg, extra),
    child: (childService) => createLogger(appLog, `${service}/${childService}`),
  }
}

/**
 * 创建 Mock Logger（用于单元测试）
 *
 * 不依赖 app.log，将日志调用转发到可注入的回调函数，
 * 便于在测试中断言日志行为。
 *
 * @param logFn - 可选的日志回调，接收级别、消息和额外数据
 * @returns Mock Logger 实例
 */
export function createMockLogger(logFn?: (level: LogLevel, msg: string, extra?: Record<string, unknown>) => void): Logger {
  function log(level: LogLevel, msg: string, extra?: Record<string, unknown>) {
    logFn?.(level, msg, extra)
  }

  return {
    debug: (msg, extra) => log("debug", msg, extra),
    info: (msg, extra) => log("info", msg, extra),
    warn: (msg, extra) => log("warn", msg, extra),
    error: (msg, extra) => log("error", msg, extra),
    child: () => createMockLogger(logFn),
  }
}
