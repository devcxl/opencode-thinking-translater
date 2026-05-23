# @devcxl/opencode-thinking-translater

[![npm version](https://img.shields.io/npm/v/@devcxl/opencode-thinking-translater)](https://www.npmjs.com/package/@devcxl/opencode-thinking-translater)

> **Beta** — 核心机制已可用，API 和 hook 接口可能在未来版本中调整。

`@devcxl/opencode-thinking-translater` 是一个 OpenCode Server Plugin，用于让模型用用户本地语言输出 thinking/reasoning 内容。

## 功能

- 通过 `experimental.chat.system.transform` 注入目标语言思考指令。
- 通过 `event` hook 监听 `message.part.updated` 中的 `reasoning` part。
- 使用 `client.app.log()` 记录 session、message、part、文本长度和完成状态。
- 不记录原始 thinking 文本，不修改 `ReasoningPart.text`，避免污染会话上下文。

## 当前不做

- 不调用外部翻译 API。
- 不在 OpenCode 原生 UI 中原地替换 reasoning 文本。
- 不使用 `experimental.chat.messages.transform` 改写历史消息。

## 安装

在 `opencode.json` 的 `plugin` 数组中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["@devcxl/opencode-thinking-translater", { "language": "zh-CN" }]
  ]
}
```

`language` 可省略。省略时插件按顺序读取 `LC_ALL`、`LC_MESSAGES`、`LANG`，无法推断时回退到 `zh-CN`。

OpenCode 会自动下载并加载插件，无需手动 `npm install`。

## 本地开发

```bash
git clone <repo>
npm install
npm run typecheck
npm test
npm run build
```

构建后在 `opencode.json` 中注册本地路径：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ["./dist/index.js", { "language": "zh-CN" }]
  ]
}
```

修改插件配置或构建产物后，需要重启 OpenCode 才会生效。

## 完整流程

```mermaid
flowchart TB
    subgraph 启动阶段["🔌 插件加载（OpenCode 启动）"]
        A["OpenCode 读取 opencode.json 配置"] --> B["加载本地插件 / npm 包"]
        B --> C["调用 ThinkingTranslaterPlugin(ctx, options)"]
    end

    C --> D

    subgraph 初始化["⚙️ 插件初始化"]
        D["createLogger(client.app?.log?.bind(client.app))"] --> D1["Logger 创建完成"]
        E["resolveLanguage(options)"] --> E1["目标语言解析完成"]
        D1 --> F["logger.info('插件已加载')"]
        E1 --> F
    end

    F --> G{"OpenCode 会话运行中"}

    subgraph HookA["📋 Hook1: experimental.chat.system.transform"]
        HA["LLM 调用触发"] --> HB["检查 output.system 中\n是否已有 SYSTEM_PROMPT_PREFIX"]
        HB -->|不存在| HC["调用 injectReasoningLanguageInstruction()"]
        HB -->|已存在| HZ["跳过（幂等）"]
        HC --> HD["调用 createReasoningLanguageInstruction(language)"]
        HD --> HE["生成指令文本:\n[@devcxl/opencode-thinking-translater]\nWhen you produce visible reasoning..."]
        HE --> HF["unshift 到 output.system 数组"]
        HF --> HG["logger.debug('已向 system prompt 注入')"]
        HG --> HO["LLM 携带新 system prompt 发起推理"]
    end

    subgraph HookB["🎧 Hook2: event"]
        IA["任意系统事件触发"] --> IB["调用 logReasoningEvent(logger, event)"]
        IB --> IC["调用 extractReasoningLogEntry(event)"]
        IC --> ID{"asEventLike(event)"}
        ID -->|"type ≠ message.part.updated"| IZ["返回 undefined，静默忽略"]
        ID -->|匹配| IE{"part.type === 'reasoning' ?"}
        IE -->|"否 (text/tool...)"| IZ
        IE -->|是| IF["提取元数据字段:\nsessionID (事件级优先)\nmessageID / partID / textLength\ncompleted (time.end 存在)\nhasDelta / eventTime"]
        IF --> IG["logger.info('收到 thinking part 更新...')"]
        IG --> IH["日志写入 OpenCode 面板\n或 console.error 降级"]
    end

    subgraph LangResolve["🌐 语言解析链 (resolveLanguage)"]
        LR1["options.language"] --> LRa["normalizeLanguageTag()"]
        LR2["env.LC_ALL"] --> LRb["normalizeLanguageTag()"]
        LR3["env.LC_MESSAGES"] --> LRc["normalizeLanguageTag()"]
        LR4["env.LANG"] --> LRd["normalizeLanguageTag()"]
        LR5["DEFAULT_LANGUAGE 'zh-CN'"] --> LRe

        LRa --> L_OR{"?? 链"}
        LRb --> L_OR
        LRc --> L_OR
        LRd --> L_OR
        LRe --> L_OR
    end

    subgraph Normalize["🔍 normalizeLanguageTag 内部"]
        N1["typeof === 'string' ?"] -->|否| NU["undefined"]
        N1 -->|是| N2["trim(), 去除 .UTF-8 / @variant"]
        N2 --> N3["base === 'C' or 'POSIX' ?"]
        N3 -->|是| NU
        N3 -->|否| N4["SAFE_LANGUAGE_TAG 正则匹配 ?"]
        N4 -->|不匹配| NU
        N4 -->|匹配| N5{"含 _ 或 - 分隔符 ?"}
        N5 -->|"否 (如 'en')"| N6["直接返回 base"]
        N5 -->|是| N7["_ 替换为 - → 分割"]
        N7 --> N8["首段小写, 2字母地区码大写, 其余保留"]
        N8 --> N9["join('-') → 'zh-CN'"]
    end

    subgraph LoggerPath["📝 日志路径 (Logger)"]
        LP1{"appLog 可用 ?"} -->|是| LP2["调用 appLog({ body })"]
        LP1 -->|否| LP3["调用 fallbackWrite()"]
        LP2 --> LP4{"调用成功 ?"}
        LP4 -->|否| LP3
        LP3 --> LP5["console.error('[service] LEVEL msg', extra)"]
    end

    HO --> HLT["LLM 根据 system prompt 指令\n用目标语言输出 reasoning"]
    HO -.->|产生 assistant 回复| EV["OpenCode 生成 message.part.updated 事件"]
    EV --> IA

    L_OR --> D
    N9 --> L_OR
    N6 --> L_OR
    NU -.->|undefined| L_NEXT["?? 链传递到下一个源"]
    L_NEXT -.-> L_OR

    HG -.->|info 级别日志| LP1
    IG -.->|info 级别日志| LP1

    style 启动阶段 fill:#1a1a2e,stroke:#e94560,color:#eee
    style 初始化 fill:#1a1a2e,stroke:#0f3460,color:#eee
    style HookA fill:#16213e,stroke:#00b4d8,color:#eee
    style HookB fill:#16213e,stroke:#48cae4,color:#eee
    style LangResolve fill:#0f3460,stroke:#f77f00,color:#eee
    style Normalize fill:#0f3460,stroke:#fcbf49,color:#eee
    style LoggerPath fill:#e76f51,stroke:#f4a261,color:#eee
```

### 流程阶段说明

| 阶段 | 描述 |
|------|------|
| 插件加载 | OpenCode 从 `opencode.json` 读取插件配置，调用 `ThinkingTranslaterPlugin` 启动函数 |
| 初始化 | 创建 Logger（优先 `app.log`，失败降级 `console.error`），按优先级链解析目标语言 |
| Hook1: system.transform | 每次 LLM 调用前触发，幂等地向 `system` 数组追加推理语言指令（仅首次注入） |
| Hook2: event | 每个系统事件触发，过滤出 `message.part.updated` + `type: "reasoning"` 的事件并记录元数据 |
| 语言解析链 | 五级降级：选项 → `LC_ALL` → `LC_MESSAGES` → `LANG` → 默认 `zh-CN` |
| 标签规范化 | `zh_CN.UTF-8@variant` → 去除编码/变体后缀 → 安全正则校验 → 大小写规范化 → `zh-CN` |
| 日志路径 | 有 `appLog` 时走 OpenCode 结构化日志，失败或无 `appLog` 时降级到 `console.error` |

## 验证重点

- 插件能正常加载，启动日志出现 `plugin loaded with reasoning language ...`。
- 使用支持 reasoning 的模型时，`message.part.updated` 中的 `reasoning` part 会产生日志。
- 多轮对话后，原始 `ReasoningPart.text` 没有被插件翻译或改写。

## 后续方向

- 增加 TUI 插件，在 `sidebar_content` 中展示 reasoning 译文缓存。
- 增加翻译器抽象，支持本地命令、OpenAI-compatible API 或复用 opencode small model。
- 向上游申请 render-time part hook，只影响 UI 展示，不落库、不进入模型上下文。
