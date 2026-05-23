/**
 * opencode-thinking-translater 插件入口
 *
 * 一个 OpenCode Server Plugin，用于引导 LLM 用用户的本地语言输出
 * reasoning/thinking 内容，并监听 reasoning part 更新事件以统计元数据。
 *
 * MVP 范围限定：
 * - 只注入 system prompt 引导，不做实时翻译
 * - 只记录事件元数据，不修改 ReasoningPart.text
 * - 不接入外部翻译 API
 * - 不污染会话上下文
 */

import type { Plugin, PluginModule, PluginOptions } from "@opencode-ai/plugin"

import { resolveLanguage } from "./language.js"
import { createLogger } from "./logger.js"
import { logReasoningEvent } from "./reasoning-event.js"
import { injectReasoningLanguageInstruction, LANGUAGE_REMINDER_PREFIX } from "./system-prompt.js"

/** 插件唯一标识，用于 OpenCode 插件管理器和去重 */
export const PLUGIN_ID = "@devcxl/opencode-thinking-translater"

/**
 * 插件主函数
 *
 * 注册两个 hook：
 * 1. experimental.chat.system.transform — 注入推理语言指令
 * 2. event — 监听 reasoning part 更新并记录日志
 *
 * @param client - OpenCode SDK client，用于日志和 API 调用
 * @param options - 插件选项，支持 language 字段指定目标语言
 */
export const ThinkingTranslaterPlugin: Plugin = async ({ client }, options?: PluginOptions) => {
  const logger = createLogger(client.app?.log?.bind(client.app))
  const language = resolveLanguage({ language: options?.language })

  logger.info(`插件已加载，目标推理语言: ${language}`)

  return {
    /**
     * 在每次 LLM 调用前向 system prompt 追加推理语言指令
     *
     * 幂等保证：通过检查 LANGUAGE_REMINDER_PREFIX 前缀避免重复注入，
     * 即使模型调用多次也只注入一次。
     */
    "experimental.chat.system.transform": async (_input, output) => {
      const alreadyInjected = output.system.some((s) => s.startsWith(LANGUAGE_REMINDER_PREFIX))
      injectReasoningLanguageInstruction(output.system, language)
      if (!alreadyInjected) {
        logger.debug(`已向 system prompt 注入推理语言指令 (${language})`)
      }
    },

    /**
     * 监听所有系统事件，过滤出 reasoning part 更新并记录日志
     *
     * 只记录元数据（ID、长度、完成状态），不记录原始 thinking 文本，
     * 避免隐私泄露。
     */
    event: async ({ event }) => {
      logReasoningEvent(logger, event)
    },
  }
}

/**
 * 插件模块导出
 *
 * OpenCode 加载器要求默认导出 { id, server } 格式。
 * satisfies PluginModule 确保类型安全，防止导出形状回归。
 */
const pluginModule = {
  id: PLUGIN_ID,
  server: ThinkingTranslaterPlugin,
} satisfies PluginModule

export default pluginModule
