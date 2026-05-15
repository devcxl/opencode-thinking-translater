/**
 * System Prompt 管理与推理语言指令注入模块
 *
 * 负责向 LLM 的 system prompt 中注入推理语言要求指令，
 * 支持中文、英语、法语、俄语、德语等世界上大多数语言，
 * 并确保同一标记不会重复注入，避免污染多轮对话上下文。
 */

import { getInstructionTemplate, getLanguageNativeName } from "./language-names.js"

/** 幂等检测前缀，用于判断本插件是否已注入过语言指令 */
export const LANGUAGE_REMINDER_PREFIX = "<language-reminder>"

/**
 * 创建推理语言要求指令文本
 *
 * 限定范围：仅影响思考过程（<think>标签内）的输出语言，
 * 不改变最终回答的语言，不要求翻译已有内容。
 *
 * 指令本身使用目标语言书写，使 LLM 在目标语言上下文中
 * 更可靠地遵循推理语言规则。
 *
 * @param language - BCP-47 语言标签，用于生成对应语言名称的指令
 * @returns 完整的 system prompt 指令字符串
 */
export function createReasoningLanguageInstruction(language: string): string {
  const name = getLanguageNativeName(language)
  const template = getInstructionTemplate(language)
  return template.replace("{name}", name)
}

/**
 * 向 system prompt 数组注入推理语言指令（幂等）
 *
 * 如果数组中已有以 LANGUAGE_REMINDER_PREFIX 开头的条目，则跳过注入，
 * 避免多轮对话中重复添加相同指令。
 *
 * @param system - system prompt 字符串数组，会被原地修改
 * @param language - BCP-47 语言标签
 */
export function injectReasoningLanguageInstruction(system: string[], language: string): void {
  if (system.some((item) => item.startsWith(LANGUAGE_REMINDER_PREFIX))) return
  system.unshift(createReasoningLanguageInstruction(language))
}
