/**
 * System Prompt 注入模块单元测试
 */

import { describe, expect, it } from "vitest"

import { createReasoningLanguageInstruction, injectReasoningLanguageInstruction } from "../src/system-prompt.js"

describe("System Prompt 指令注入", () => {
  it("能生成中文思维指令", () => {
    const instruction = createReasoningLanguageInstruction("zh-CN")

    expect(instruction).toContain("<language-reminder>")
    expect(instruction).toContain("使用中文进行思考")
    expect(instruction).toContain("<think>")
    expect(instruction).toContain("</language-reminder>")
  })

  it("能生成英文思维指令", () => {
    const instruction = createReasoningLanguageInstruction("en-US")

    expect(instruction).toContain("<language-reminder>")
    expect(instruction).toContain("use English for thinking")
    expect(instruction).toContain("</language-reminder>")
  })

  it("能生成法语思维指令（模板使用法语书写）", () => {
    const instruction = createReasoningLanguageInstruction("fr-FR")

    expect(instruction).toContain("utilisez le français pour réfléchir")
    expect(instruction).toContain("Dans votre processus")
  })

  it("能生成俄语思维指令（模板使用俄语书写）", () => {
    const instruction = createReasoningLanguageInstruction("ru-RU")

    expect(instruction).toContain("русский")
    expect(instruction).toContain("думайте на")
  })

  it("能生成德语思维指令（模板使用德语书写）", () => {
    const instruction = createReasoningLanguageInstruction("de-DE")

    expect(instruction).toContain("denke auf Deutsch")
    expect(instruction).toContain("Verwende in deinem Denkprozess")
  })

  it("能生成日语思维指令（模板使用日语书写）", () => {
    const instruction = createReasoningLanguageInstruction("ja-JP")

    expect(instruction).toContain("日本語で考えること")
    expect(instruction).toContain("思考プロセス")
  })

  it("纯语言代码回退到母语模板", () => {
    const instruction = createReasoningLanguageInstruction("ja")

    expect(instruction).toContain("日本語で考えること")
  })

  it("未知语言回退到英文模板", () => {
    const instruction = createReasoningLanguageInstruction("xx-XX")

    expect(instruction).toContain("use xx-XX for thinking")
    expect(instruction).toContain("In your thinking process")
  })

  it("重复注入时保持幂等（只注入一次）", () => {
    const system = ["existing instruction"]

    injectReasoningLanguageInstruction(system, "zh-CN")
    injectReasoningLanguageInstruction(system, "zh-CN")

    expect(system).toHaveLength(2)
    expect(system[0]).toContain("使用中文进行思考")
  })

  it("不同语言连续注入时仅首次生效（幂等基于前缀）", () => {
    const system: string[] = []

    injectReasoningLanguageInstruction(system, "zh-CN")
    injectReasoningLanguageInstruction(system, "en-US")

    expect(system).toHaveLength(1)
    expect(system[0]).toContain("中文")
  })
})
