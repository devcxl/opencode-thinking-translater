/**
 * Reasoning 事件提取与日志模块单元测试
 *
 * 覆盖 v1/v2 事件格式兼容性、非 reasoning 事件过滤、隐私保护策略。
 */

import { describe, expect, it, vi } from "vitest"

import { createMockLogger } from "../src/logger.js"
import { extractReasoningLogEntry } from "../src/reasoning-event.js"
import { logReasoningEvent } from "../src/reasoning-event.js"

describe("Reasoning 事件处理", () => {
  it("能从 v1 格式事件中提取元数据（带 delta）", () => {
    const entry = extractReasoningLogEntry({
      type: "message.part.updated",
      properties: {
        delta: "新增",
        part: {
          id: "prt_1",
          sessionID: "ses_1",
          messageID: "msg_1",
          type: "reasoning",
          text: "思考内容",
          time: { start: 1, end: 2 },
        },
      },
    })

    expect(entry).toEqual({
      sessionID: "ses_1",
      messageID: "msg_1",
      partID: "prt_1",
      textLength: 4,
      completed: true,
      hasDelta: true,
      eventTime: undefined,
    })
  })

  it("能从 v2 格式事件中提取事件级别的 sessionID 和时间戳", () => {
    const entry = extractReasoningLogEntry({
      type: "message.part.updated",
      properties: {
        sessionID: "ses_from_event",
        time: 42,
        part: {
          id: "prt_1",
          sessionID: "ses_from_part",
          messageID: "msg_1",
          type: "reasoning",
          text: "abcd",
          time: { start: 1 },
        },
      },
    })

    expect(entry?.sessionID).toBe("ses_from_event")
    expect(entry?.eventTime).toBe(42)
    expect(entry?.completed).toBe(false)
  })

  it("忽略非 reasoning 类型的 part 更新", () => {
    expect(
      extractReasoningLogEntry({
        type: "message.part.updated",
        properties: { part: { type: "text", text: "hello" } },
      }),
    ).toBeUndefined()
  })

  it("忽略不相关的 reasoning 流事件", () => {
    expect(
      extractReasoningLogEntry({
        type: "session.next.reasoning.ended",
        properties: { text: "private thinking" },
      }),
    ).toBeUndefined()
  })

  it("日志记录中不包含原始 thinking 文本（隐私保护）", () => {
    const logFn = vi.fn()
    const logger = createMockLogger(logFn)

    logReasoningEvent(logger, {
      type: "message.part.updated",
      properties: {
        part: {
          id: "prt_1",
          sessionID: "ses_1",
          messageID: "msg_1",
          type: "reasoning",
          text: "private thinking text",
          time: { start: 1 },
        },
      },
    })

    expect(logFn).toHaveBeenCalledTimes(1)
    const [, extra] = logFn.mock.calls[0]!
    expect(JSON.stringify(extra)).not.toContain("private thinking text")
  })
})
