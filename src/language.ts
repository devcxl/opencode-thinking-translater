/**
 * 语言环境检测与语言标签规范化模块
 *
 * 负责从插件选项或系统环境变量中推断用户期望的目标语言，
 * 并将各种格式的 locale 字符串规范化为统一的 BCP-47 风格标签。
 */

/** 无法从环境中推断语言时的默认值 */
export const DEFAULT_LANGUAGE = "zh-CN"

/** 插件选项接口 */
export interface ThinkingTranslaterOptions {
  /** 用户指定的目标语言标签，优先级高于环境变量 */
  language?: unknown
}

/**
 * 安全语言标签正则表达式
 * 格式满足基本 BCP-47 风格：2-3 字母语言代码 + 可选子标签
 * 用于防止恶意字符串注入到 system prompt 中
 */
const SAFE_LANGUAGE_TAG = /^[a-zA-Z]{2,3}(?:[-_][a-zA-Z0-9]{2,8})*$/

/**
 * 将各种格式的 locale 值规范化为 BCP-47 风格语言标签
 *
 * 处理示例：
 *   "zh_CN.UTF-8"      → "zh-CN"
 *   "en_US.UTF-8@variant" → "en-US"
 *   "C" / "POSIX"      → undefined（通用 locale，无实际语言信息）
 *   "zh-CN\n恶意指令"   → undefined（安全校验拒绝）
 *
 * @param value - 来自选项或环境变量的原始 locale 值
 * @returns 规范化后的语言标签，无效值返回 undefined
 */
export function normalizeLanguageTag(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const raw = value.trim()
  if (!raw) return undefined

  // 移除编码后缀（如 .UTF-8）和变体标记（如 @variant）
  const base = raw.split(".", 1)[0]?.split("@", 1)[0]
  if (!base || base === "C" || base === "POSIX") return undefined
  // 安全校验：拒绝包含换行、控制字符等异常内容的语言标签
  if (!SAFE_LANGUAGE_TAG.test(base)) return undefined

  // 无分隔符的纯语言代码（如 "en" "zh"），直接原样返回
  const hasLocaleSeparator = base.includes("_") || base.includes("-")
  if (!hasLocaleSeparator) return base

  // 分割各部分并规范化：语言代码小写，地区代码大写，其余保持原样
  const parts = base.replaceAll("_", "-").split("-").filter(Boolean)
  if (!parts.length) return undefined

  return parts
    .map((part, index) => {
      if (index === 0) return part.toLowerCase()
      if (/^[a-zA-Z]{2}$/.test(part)) return part.toUpperCase()
      return part
    })
    .join("-")
}

/**
 * 按优先级解析最终目标语言
 *
 * 优先级（从高到低）：
 *   1. 插件选项中显式指定的 language
 *   2. 环境变量 LC_ALL（覆盖所有 locale 设置）
 *   3. 环境变量 LC_MESSAGES（消息分类 locale）
 *   4. 环境变量 LANG（系统默认 locale）
 *   5. 预定义的默认值 DEFAULT_LANGUAGE
 *
 * @param options - 插件选项，可包含 language 字段
 * @param env - 环境变量对象，仅用于单元测试注入，生产环境不传
 * @returns 解析后的语言标签
 */
export function resolveLanguage(
  options: ThinkingTranslaterOptions = {},
  env: NodeJS.ProcessEnv = process.env,
): string {
  return (
    normalizeLanguageTag(options.language) ??
    normalizeLanguageTag(env.LC_ALL) ??
    normalizeLanguageTag(env.LC_MESSAGES) ??
    normalizeLanguageTag(env.LANG) ??
    DEFAULT_LANGUAGE
  )
}
