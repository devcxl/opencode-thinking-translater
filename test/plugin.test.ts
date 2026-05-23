/**
 * 插件集成测试
 *
 * 覆盖插件主函数的三个核心行为：
 * 1. 通过 experimental.chat.system.transform 注入语言指令
 * 2. 通过 event hook 响应 reasoning part 更新
 * 3. 默认导出格式符合 OpenCode 插件契约
 */

import { describe, expect, it, vi } from "vitest"

import pluginModule, { PLUGIN_ID, ThinkingTranslaterPlugin } from "../src/index.js"

describe("插件集成行为", () => {
  it("system prompt 注入生效：注入中文思维指令", async () => {
    const log = vi.fn().mockResolvedValue(undefined)
    const plugin = await ThinkingTranslaterPlugin({ client: { app: { log } } } as never, { language: "zh-CN" })
    const output = { system: ["base"] }

    await plugin["experimental.chat.system.transform"]?.({ model: {} } as never, output as never)

    expect(output.system).toHaveLength(2)
    expect(output.system[0]).toContain("<language-reminder>")
    expect(output.system[0]).toContain("使用中文进行思考")
    expect(output.system[0]).toContain("<think>")
  })

  it("reasoning part 更新时产生结构化日志", async () => {
    const log = vi.fn().mockResolvedValue(undefined)
    const plugin = await ThinkingTranslaterPlugin({ client: { app: { log } } } as never, { language: "zh-CN" })

    await plugin.event?.({
      event: {
        type: "message.part.updated",
        properties: {
          part: {
            id: "prt_1",
            sessionID: "ses_1",
            messageID: "msg_1",
            type: "reasoning",
            text: "abcd",
            time: { start: 1, end: 2 },
          },
        },
      },
    } as never)

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          service: "thinking-translater",
          level: "info",
          extra: expect.objectContaining({ textLength: 4, completed: true }),
        }),
      }),
    )
  })

  it("默认导出格式符合 OpenCode 契约", () => {
    expect(PLUGIN_ID).toBe("@devcxl/opencode-thinking-translater")
    expect(pluginModule.id).toBe(PLUGIN_ID)
    expect(pluginModule.server).toBe(ThinkingTranslaterPlugin)
  })
})
