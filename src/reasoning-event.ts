/**
 * Reasoning Part 事件监听与日志记录模块
 *
 * 负责从 OpenCode 的 message.part.updated 事件中识别类型为 reasoning 的 part，
 * 提取元数据（ID、长度、完成状态等）并记录日志。
 *
 * 设计原则：
 * - 只记录元数据，不记录原始 thinking 文本，避免隐私泄露
 * - 兼容 v1 和 v2 事件格式的字段差异
 * - 非 "message.part.updated" 事件静默忽略
 */

import type { Logger } from "./logger.js"

/**
 * 松散的事件结构接口
 *
 * 兼容 OpenCode SDK v1（properties.part + 可选 delta）和
 * v2（properties.sessionID + time + part）两种格式。
 */
interface EventLike {
  type?: string
  properties?: {
    sessionID?: string
    time?: number
    delta?: string
    part?: PartLike
  }
}

/** Reasoning Part 的接口定义，匹配 @opencode-ai/sdk 中的 ReasoningPart */
interface PartLike {
  id?: string
  sessionID?: string
  messageID?: string
  type?: string
  text?: string
  time?: {
    start?: number
    end?: number
  }
}

/**
 * 从 reasoning part 事件中提取的日志条目
 *
 * 仅包含标识信息和统计指标，不包含原始文本内容，
 * 避免将用户的私有推理过程写入日志系统。
 */
export interface ReasoningLogEntry {
  /** 会话 ID（优先取事件级别的，其次取 part 级别的） */
  sessionID?: string
  /** 消息 ID */
  messageID?: string
  /** Part 唯一标识 */
  partID?: string
  /** 当前 thinking 文本的字符长度 */
  textLength: number
  /** 是否已完成思考（time.end 存在） */
  completed: boolean
  /** 该更新是否包含增量 delta（流式输出过程中的中间更新） */
  hasDelta: boolean
  /** 事件发生时间戳（v2 事件级别的时间字段） */
  eventTime?: number
}

/**
 * 类型守卫：判断值是否为非 null 对象
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * 将原始事件对象转换为内部 EventLike 格式
 *
 * 作为类型安全的边界函数，过滤掉无关事件类型，
 * 仅当 type 为 "message.part.updated" 且存在 properties 时返回有效值。
 *
 * @param event - 来自 event hook 的原始事件对象
 * @returns 转换后的事件对象，无关事件返回 undefined
 */
function asEventLike(event: unknown): EventLike | undefined {
  if (!isRecord(event)) return undefined
  if (event.type !== "message.part.updated") return undefined
  if (!isRecord(event.properties)) return undefined
  return event as EventLike
}

/**
 * 从事件中提取 reasoning part 的日志元数据
 *
 * 仅处理 type 为 "reasoning" 的 part，
 * 非 reasoning 类型的 part 更新（如 text、tool 等）被直接忽略。
 *
 * @param event - 原始事件对象
 * @returns 日志条目对象，非 reasoning 事件返回 undefined
 */
export function extractReasoningLogEntry(event: unknown): ReasoningLogEntry | undefined {
  const eventLike = asEventLike(event)
  const part = eventLike?.properties?.part
  if (!part || part.type !== "reasoning") return undefined

  return {
    sessionID: eventLike.properties?.sessionID ?? part.sessionID,
    messageID: part.messageID,
    partID: part.id,
    textLength: typeof part.text === "string" ? part.text.length : 0,
    completed: typeof part.time?.end === "number",
    hasDelta: typeof eventLike.properties?.delta === "string",
    eventTime: eventLike.properties?.time,
  }
}

/**
 * 记录 reasoning part 更新事件到日志
 *
 * 仅记录元数据（ID、长度、状态），不记录原始 thinking 文本内容，
 * 防止私有思考过程泄露到日志系统。
 *
 * 如果事件不是 reasoning part 更新，静默返回。
 *
 * @param logger - Logger 实例
 * @param event - 原始事件对象
 */
export function logReasoningEvent(logger: Logger, event: unknown): void {
  const entry = extractReasoningLogEntry(event)
  if (!entry) return

  logger.info(
    `收到 thinking part 更新: session=${entry.sessionID ?? "未知"} message=${entry.messageID ?? "未知"} part=${entry.partID ?? "未知"} 长度=${entry.textLength} 已完成=${entry.completed}`,
    { ...entry },
  )
}
