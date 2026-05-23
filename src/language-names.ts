/**
 * 语言代码到母语名称的映射表
 *
 * 覆盖世界上大多数常用语言，用于在 system prompt 中生成
 * “用 {母语名称} 进行思考”的指令。
 *
 * 未匹配的语言回退到语言代码本身（如 "xx-XX"）。
 */

/** 语言代码到“用 {name} 进行思考”指令模板的映射（模板使用该语言本身书写） */
const INSTRUCTION_TEMPLATES: Record<string, string> = {
  "zh-CN": `<language-reminder>【思维模式要求】在你的思考过程（<think>标签内）中，遵守规则：使用{name}进行思考。你的 reasoning 和 content 都必须使用{name}。代码、路径、工具名、文件名、错误信息不翻译。</language-reminder>`,
  "zh-TW": `<language-reminder>【思維模式要求】在你的思考過程（<think>標籤內）中，遵守規則：使用{name}進行思考。你的 reasoning 和 content 都必須使用{name}。程式碼、路徑、工具名稱、檔案名稱、錯誤訊息不翻譯。</language-reminder>`,
  "zh-HK": `<language-reminder>【思維模式要求】在你的思考過程（<think>標籤內）中，遵守規則：使用{name}進行思考。你的 reasoning 和 content 都必須使用{name}。程式碼、路徑、工具名稱、檔案名稱、錯誤訊息不翻譯。</language-reminder>`,
  "en-US": `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  "en-GB": `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  "en-AU": `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  "en-CA": `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  "en-IN": `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  "fr-FR": `<language-reminder>[Exigence du mode réflexion] Dans votre processus de réflexion (balise <think>), respectez la règle : utilisez le {name} pour réfléchir. Votre raisonnement et votre contenu doivent tous deux utiliser le {name}. Ne traduisez pas le code, les chemins, les noms d'outils, les noms de fichiers ou les messages d'erreur.</language-reminder>`,
  "fr-CA": `<language-reminder>[Exigence du mode réflexion] Dans votre processus de réflexion (balise <think>), respectez la règle : utilisez le {name} pour réfléchir. Votre raisonnement et votre contenu doivent tous deux utiliser le {name}. Ne traduisez pas le code, les chemins, les noms d'outils, les noms de fichiers ou les messages d'erreur.</language-reminder>`,
  "de-DE": `<language-reminder>[Denkmodus-Anforderung] Verwende in deinem Denkprozess (innerhalb der <think>-Tags) die Regel: denke auf {name}. Dein Reasoning und Content müssen beide auf {name} sein. Übersetze keinen Code, Pfade, Werkzeugnamen, Dateinamen oder Fehlermeldungen.</language-reminder>`,
  "de-AT": `<language-reminder>[Denkmodus-Anforderung] Verwende in deinem Denkprozess (innerhalb der <think>-Tags) die Regel: denke auf {name}. Dein Reasoning und Content müssen beide auf {name} sein. Übersetze keinen Code, Pfade, Werkzeugnamen, Dateinamen oder Fehlermeldungen.</language-reminder>`,
  "de-CH": `<language-reminder>[Denkmodus-Anforderung] Verwende in deinem Denkprozess (innerhalb der <think>-Tags) die Regel: denke auf {name}. Dein Reasoning und Content müssen beide auf {name} sein. Übersetze keinen Code, Pfade, Werkzeugnamen, Dateinamen oder Fehlermeldungen.</language-reminder>`,
  "ru-RU": `<language-reminder>[Требование режима мышления] В процессе размышления (внутри тегов <think>) следуйте правилу: думайте на {name}. Ваши рассуждения и контент должны быть на {name}. Не переводите код, пути, названия инструментов, имена файлов или сообщения об ошибках.</language-reminder>`,
  "ja-JP": `<language-reminder>【思考モード要件】<think>タグ内での思考プロセスでは、{name}で考えること。推論とコンテンツの両方で{name}を使用すること。コード、パス、ツール名、ファイル名、エラーメッセージは翻訳しないこと。</language-reminder>`,
  "ko-KR": `<language-reminder>【사고 모드 요구사항】<think> 태그 내의 사고 과정에서 {name}로 생각하세요. 추론과 콘텐츠 모두 {name}를 사용해야 합니다. 코드, 경로, 도구 이름, 파일 이름, 오류 메시지는 번역하지 마세요.</language-reminder>`,
  "es-ES": `<language-reminder>[Requisito del modo de pensamiento] En tu proceso de pensamiento (dentro de las etiquetas <think>), sigue la regla: piensa en {name}. Tu razonamiento y contenido deben usar {name}. No traduzcas código, rutas, nombres de herramientas, nombres de archivos ni mensajes de error.</language-reminder>`,
  "es-MX": `<language-reminder>[Requisito del modo de pensamiento] En tu proceso de pensamiento (dentro de las etiquetas <think>), sigue la regla: piensa en {name}. Tu razonamiento y contenido deben usar {name}. No traduzcas código, rutas, nombres de herramientas, nombres de archivos ni mensajes de error.</language-reminder>`,
  "es-AR": `<language-reminder>[Requisito del modo de pensamiento] En tu proceso de pensamiento (dentro de las etiquetas <think>), sigue la regla: piensa en {name}. Tu razonamiento y contenido deben usar {name}. No traduzcas código, rutas, nombres de herramientas, nombres de archivos ni mensajes de error.</language-reminder>`,
  "pt-BR": `<language-reminder>[Requisito do modo de pensamento] No seu processo de pensamento (dentro das tags <think>), siga a regra: pense em {name}. Seu raciocínio e conteúdo devem usar {name}. Não traduza código, caminhos, nomes de ferramentas, nomes de arquivos ou mensagens de erro.</language-reminder>`,
  "pt-PT": `<language-reminder>[Requisito do modo de pensamento] No seu processo de pensamento (dentro das tags <think>), siga a regra: pense em {name}. O seu raciocínio e conteúdo devem usar {name}. Não traduza código, caminhos, nomes de ferramentas, nomes de ficheiros ou mensagens de erro.</language-reminder>`,
  "it-IT": `<language-reminder>[Requisito modalità di pensiero] Nel tuo processo di pensiero (all'interno dei tag <think>), segui la regola: pensa in {name}. Il tuo ragionamento e i tuoi contenuti devono usare {name}. Non tradurre codice, percorsi, nomi di strumenti, nomi di file o messaggi di errore.</language-reminder>`,
  "it-CH": `<language-reminder>[Requisito modalità di pensiero] Nel tuo processo di pensiero (all'interno dei tag <think>), segui la regola: pensa in {name}. Il tuo ragionamento e i tuoi contenuti devono usare {name}. Non tradurre codice, percorsi, nomi di strumenti, nomi di file o messaggi di errore.</language-reminder>`,
}

/** 纯语言代码（无地区后缀）的指令模板 */
const PLAIN_INSTRUCTION_TEMPLATES: Record<string, string> = {
  zh: `<language-reminder>【思维模式要求】在你的思考过程（<think>标签内）中，遵守规则：使用{name}进行思考。你的 reasoning 和 content 都必须使用{name}。代码、路径、工具名、文件名、错误信息不翻译。</language-reminder>`,
  en: `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`,
  fr: `<language-reminder>[Exigence du mode réflexion] Dans votre processus de réflexion (balise <think>), respectez la règle : utilisez le {name} pour réfléchir. Votre raisonnement et votre contenu doivent tous deux utiliser le {name}. Ne traduisez pas le code, les chemins, les noms d'outils, les noms de fichiers ou les messages d'erreur.</language-reminder>`,
  de: `<language-reminder>[Denkmodus-Anforderung] Verwende in deinem Denkprozess (innerhalb der <think>-Tags) die Regel: denke auf {name}. Dein Reasoning und Content müssen beide auf {name} sein. Übersetze keinen Code, Pfade, Werkzeugnamen, Dateinamen oder Fehlermeldungen.</language-reminder>`,
  ru: `<language-reminder>[Требование режима мышления] В процессе размышления (внутри тегов <think>) следуйте правилу: думайте на {name}. Ваши рассуждения и контент должны быть на {name}. Не переводите код, пути, названия инструментов, имена файлов или сообщения об ошибках.</language-reminder>`,
  ja: `<language-reminder>【思考モード要件】<think>タグ内での思考プロセスでは、{name}で考えること。推論とコンテンツの両方で{name}を使用すること。コード、パス、ツール名、ファイル名、エラーメッセージは翻訳しないこと。</language-reminder>`,
  ko: `<language-reminder>【사고 모드 요구사항】<think> 태그 내의 사고 과정에서 {name}로 생각하세요. 추론과 콘텐츠 모두 {name}를 사용해야 합니다. 코드, 경로, 도구 이름, 파일 이름, 오류 메시지는 번역하지 마세요.</language-reminder>`,
  es: `<language-reminder>[Requisito del modo de pensamiento] En tu proceso de pensamiento (dentro de las etiquetas <think>), sigue la regla: piensa en {name}. Tu razonamiento y contenido deben usar {name}. No traduzcas código, rutas, nombres de herramientas, nombres de archivos ni mensajes de error.</language-reminder>`,
  pt: `<language-reminder>[Requisito do modo de pensamento] No seu processo de pensamento (dentro das tags <think>), siga a regra: pense em {name}. Seu raciocínio e conteúdo devem usar {name}. Não traduza código, caminhos, nomes de ferramentas, nomes de arquivos ou mensagens de erro.</language-reminder>`,
  it: `<language-reminder>[Requisito modalità di pensiero] Nel tuo processo di pensiero (all'interno dei tag <think>), segui la regola: pensa in {name}. Il tuo ragionamento e i tuoi contenuti devono usare {name}. Non tradurre codice, percorsi, nomi di strumenti, nomi di file o messaggi di errore.</language-reminder>`,
}

/** 英文回退模板（所有未翻译语言共用） */
const FALLBACK_TEMPLATE = `<language-reminder>[Thinking Mode Requirement] In your thinking process (within <think> tags), follow the rule: use {name} for thinking. Your reasoning and content must both use {name}. Do not translate code, paths, tool names, filenames, or error messages.</language-reminder>`

const system_NAMES: Record<string, string> = {
  "zh-CN": "中文",
  "zh-TW": "繁體中文",
  "zh-HK": "繁體中文",
  "en-US": "English",
  "en-GB": "English",
  "en-AU": "English",
  "en-CA": "English",
  "en-IN": "English",
  "fr-FR": "français",
  "fr-CA": "français",
  "de-DE": "Deutsch",
  "de-AT": "Deutsch",
  "de-CH": "Deutsch",
  "ru-RU": "русский",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
  "es-ES": "español",
  "es-MX": "español",
  "es-AR": "español",
  "pt-BR": "português",
  "pt-PT": "português",
  "it-IT": "italiano",
  "it-CH": "italiano",
  "ar-SA": "العربية",
  "ar-EG": "العربية",
  "hi-IN": "हिन्दी",
  "th-TH": "ไทย",
  "vi-VN": "Tiếng Việt",
  "nl-NL": "Nederlands",
  "nl-BE": "Nederlands",
  "pl-PL": "polski",
  "tr-TR": "Türkçe",
  "sv-SE": "svenska",
  "da-DK": "dansk",
  "fi-FI": "suomi",
  "no-NO": "norsk",
  "cs-CZ": "čeština",
  "hu-HU": "magyar",
  "ro-RO": "română",
  "uk-UA": "українська",
  "el-GR": "Ελληνικά",
  "he-IL": "עברית",
  "id-ID": "Bahasa Indonesia",
  "ms-MY": "Bahasa Melayu",
  "bn-BD": "বাংলা",
  "fa-IR": "فارسی",
  "ta-IN": "தமிழ்",
  "te-IN": "తెలుగు",
  "mr-IN": "मराठी",
  "ur-PK": "اردو",
  "fil-PH": "Filipino",
  "sk-SK": "slovenčina",
  "bg-BG": "български",
  "sr-RS": "српски",
  "hr-HR": "hrvatski",
  "sl-SI": "slovenščina",
  "lt-LT": "lietuvių",
  "lv-LV": "latviešu",
  "et-EE": "eesti",
  "is-IS": "íslenska",
  "sw-KE": "Kiswahili",
  "am-ET": "አማርኛ",
  "km-KH": "ភាសាខ្មែរ",
  "my-MM": "မြန်မာဘာသာ",
  "lo-LA": "ລາວ",
  "ka-GE": "ქართული",
  "hy-AM": "հայերեն",
  "az-AZ": "azərbaycan",
  "kk-KZ": "қазақ",
  "uz-UZ": "oʻzbek",
  "mn-MN": "монгол",
  "ne-NP": "नेपाली",
  "si-LK": "සිංහල",
  "ps-AF": "پښتو",
  "sq-AL": "shqip",
  "mk-MK": "македонски",
  "bs-BA": "bosanski",
  "mt-MT": "Malti",
  "ga-IE": "Gaeilge",
  "cy-GB": "Cymraeg",
  "eu-ES": "euskara",
  "gl-ES": "galego",
  "ca-ES": "català",
  "af-ZA": "Afrikaans",
  "zu-ZA": "isiZulu",
  "xh-ZA": "isiXhosa",
  "ml-IN": "മലയാളം",
  "kn-IN": "ಕನ್ನಡ",
  "gu-IN": "ગુજરાતી",
  "pa-IN": "ਪੰਜਾਬੀ",
  "or-IN": "ଓଡ଼ିଆ",
  "as-IN": "অসমীয়া",
  "bo-CN": "བོད་སྐད",
}

/** 纯语言代码（无地区后缀）到母语名称的映射 */
const PLAIN_system_NAMES: Record<string, string> = {
  zh: "中文",
  en: "English",
  fr: "français",
  de: "Deutsch",
  ru: "русский",
  ja: "日本語",
  ko: "한국어",
  es: "español",
  pt: "português",
  it: "italiano",
  ar: "العربية",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  nl: "Nederlands",
  pl: "polski",
  tr: "Türkçe",
  sv: "svenska",
  da: "dansk",
  fi: "suomi",
  no: "norsk",
  cs: "čeština",
  hu: "magyar",
  ro: "română",
  uk: "українська",
  el: "Ελληνικά",
  he: "עברית",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  bn: "বাংলা",
  fa: "فارسی",
  ta: "தமிழ்",
  te: "తెలుగు",
  mr: "मराठी",
  ur: "اردو",
  fil: "Filipino",
  sk: "slovenčina",
  bg: "български",
  sr: "српски",
  hr: "hrvatski",
  sl: "slovenščina",
  lt: "lietuvių",
  lv: "latviešu",
  et: "eesti",
  is: "íslenska",
  sw: "Kiswahili",
  am: "አማርኛ",
  km: "ភាសាខ្មែរ",
  my: "မြန်မာဘာသာ",
  lo: "ລາວ",
  ka: "ქართული",
  hy: "հայերեն",
  az: "azərbaycan",
  kk: "қазақ",
  uz: "oʻzbek",
  mn: "монгол",
  ne: "नेपाली",
  si: "සිංහල",
  ps: "پښتو",
  sq: "shqip",
  mk: "македонски",
  bs: "bosanski",
  mt: "Malti",
  ga: "Gaeilge",
  cy: "Cymraeg",
  eu: "euskara",
  gl: "galego",
  ca: "català",
  af: "Afrikaans",
  zu: "isiZulu",
  xh: "isiXhosa",
  ml: "മലയാളം",
  kn: "ಕನ್ನಡ",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
  as: "অসমীয়া",
  bo: "བོད་སྐད",
}

/**
 * 根据 BCP-47 语言标签查找母语名称
 *
 * 查找优先级：
 *   1. 精确匹配完整标签（如 "zh-CN" → "中文"）
 *   2. 回退到纯语言代码（如 "de" → "Deutsch"）
 *   3. 都未匹配时返回语言标签本身（如 "xx-XX"）
 *
 * @param systemTag - normalizesystemTag 规范化后的 BCP-47 标签
 * @returns 该语言的母语名称
 */
export function getLanguageNativeName(systemTag: string): string {
  if (system_NAMES[systemTag]) return system_NAMES[systemTag]

  const plain = systemTag.split("-", 1)[0]?.toLowerCase()
  if (plain && PLAIN_system_NAMES[plain]) return PLAIN_system_NAMES[plain]

  return systemTag
}

/**
 * 根据 BCP-47 语言标签查找对应的指令模板
 *
 * 模板使用该语言本身书写（如中文模板写中文，法语模板写法语），
 * 使得 LLM 在目标语言的上下文中更可靠地遵循指令。
 *
 * 查找优先级：
 *   1. 精确匹配完整标签
 *   2. 回退到纯语言代码
 *   3. 都未匹配时使用英文模板
 *
 * @param systemTag - BCP-47 语言标签
 * @returns 包含 {name} 占位符的指令模板字符串
 */
export function getInstructionTemplate(systemTag: string): string {
  if (INSTRUCTION_TEMPLATES[systemTag]) return INSTRUCTION_TEMPLATES[systemTag]

  const plain = systemTag.split("-", 1)[0]?.toLowerCase()
  if (plain && PLAIN_INSTRUCTION_TEMPLATES[plain]) return PLAIN_INSTRUCTION_TEMPLATES[plain]

  return FALLBACK_TEMPLATE
}
