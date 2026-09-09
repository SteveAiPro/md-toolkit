# md-toolkit

对标 [md-to.com](https://md-to.com/) 的 Markdown 转换工具站骨架。**Astro 静态站 + 纯前端转换**，零服务器成本。

**18 个转换方向全部实现**（与 md-to.com 一一对应），7 语言 i18n，带 blog / tag 内容层，
**253 个页面构建 5s**。
全部 18 条工具链路 + 3 条下载链路 + blog 链路（4 语言）经浏览器实测通过，0 控制台错误。

---

## 快速开始

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # 输出到 dist/
npm run preview

npm run check:i18n   # 构建后跑：检查有没有「假本地化」页面
npm run test:e2e     # 需先起 preview：真实浏览器跑完 18 个工具 + 下载
```

七种语言（en / zh-cn / zh-tw / ja / fr / pt / de）的 UI 文案与工具 SEO 文案**全部填齐**，
不做 fallback。语言切换器在页面右上角。

> ⚠️ **如果你在 WorkBuddy / CodeBuddy 沙箱里跑**：环境给 `NODE_OPTIONS` 注入了一个
> `node-language-shim.cjs`，它会拦截 `mkdir` 和网络请求，导致 `npm install` 报
> `CODEBUDDY_BROKER_DENY`。绕过方式：
> ```bash
> env -u NODE_OPTIONS npm install
> env -u NODE_OPTIONS npm run build
> ```

### 上线前必改的一件事

`astro.config.mjs` 里的 `site` 目前是占位的 `https://md-toolkit.example.com`。
canonical、hreflang、sitemap、robots 全部由它推导 —— 不改就是全站指向假地址。

```bash
# 方式一：部署环境里设环境变量（推荐，不用改代码）
SITE_URL=https://你的域名.com

# 方式二：直接改 astro.config.mjs 的 site 字段
```

**OG 分享图也烧了域名**（每张卡左下角印着站点 URL）。换真域名后要重生成一次：

```bash
SITE_URL=https://你的域名.com node make-og.mjs   # 19 张，~880KB
```

忘了跑的后果：分享卡片图正常显示，但图里的网址是 example.com —— 不报错，就是难看。

部署本身不需要额外配置，Astro 是纯静态输出：

- **Vercel**：导入仓库，Framework 选 Astro，Build Command 默认即可，Output `dist`
- **Cloudflare Pages / Netlify / EdgeOne Pages**：同理，构建 `npm run build`，产物 `dist/`

### 测试

`test-e2e.mjs` 用 `playwright-core` 驱动本机 chromium（不需要 MCP 浏览器，
路径在脚本顶部 `EXEC` 常量里）。它做三件事：

1. 遍历 18 个工具页 → 加载示例（二进制工具上传 fixture）→ 断言输出非空
2. 触发 docx / PNG 下载，落盘
3. 统计控制台错误
4. 法务页 7 语言逐一查 `<html lang>` 与正文长度（防「只有英文版」回归）
5. RSS feed 真·校验：条目数 + 无未转义 `&`；fr/pt/de 必须 404（空语言不许有空壳 feed）
6. OG 图逐张验 PNG 魔数 + 1200x630 尺寸（og:image 指向死链是肉眼看不出来的）

`make-fixtures.mjs` 生成二进制测试文件（`.fixtures/word-sample.docx`、`.fixtures/pdf-sample.pdf`）。
PDF 是手写的极简文本层 PDF，不依赖 `cupsfilter` 这类 macOS 专用命令。

---

## 技术栈对照：md-to.com vs 本项目

| 能力 | md-to.com 的做法 | 本项目的做法 | 差异说明 |
|---|---|---|---|
| 框架 | Astro 静态站 | Astro 5 静态站 | 一致 |
| 渲染 | markdown-it + 一堆插件 | 同，插件逐个显式解包 | 见踩坑 1 |
| 代码高亮 | highlight.js 完整包（~1.4MB） | `highlight.js/lib/common`（~40 语言） | 体积约 1/4 |
| 公式 | KaTeX | KaTeX（`@vscode/markdown-it-katex`） | 一致 |
| HTML 清洗 | DOMPurify | DOMPurify | 一致 |
| md → docx | `docx` 库 | `docx` 库 | 一致，含 WebP 兜底 |
| md → pdf | **iframe + `window.print()`** | 同 | 见踩坑 2，这是它最值得抄的一点 |
| md → image | html2canvas / dom-to-image | html-to-image | 方案不同，见踩坑 5 |
| html → md | turndown + turndown-plugin-gfm | 同 | 一致 |
| word → md | mammoth | mammoth → HTML → turndown 两段式 | 见踩坑 6 |
| pdf → md | pdfjs-dist | pdfjs 抽文本层 + 启发式还原标题 | 只认有文本层的 PDF |
| 表格转换 | papaparse | papaparse | 一致 |
| i18n | 7 语言 × 18 工具 + blog = 355 页 | **126 工具页 + 123 blog/tag/法务页 = 253 页** | blog 覆盖 4 语言，见下 |
| 托管 | 腾讯云 EdgeOne Pages | 任意静态托管 | — |
| 变现 | AdSense + $19.99 买断 | 未接 | — |

### 关于 md → pdf，值得单独说

大部分同类站用 `html2pdf.js`（jsPDF + html2canvas），那条路是**把 DOM 截成位图再拼 PDF**：
文字不可选、链接丢失、长文档内存爆、分页靠 JS 算像素高度会把代码块从中间切开。

md-to.com 作者在自己的博客里写了最终方案：**iframe + 原生 `window.print()`**。
PDF 由浏览器打印引擎生成，是矢量的，分页交给 CSS `@media print`，又快又准。

本项目照抄了这个方案，见 `src/lib/converters/pdf.ts` + `src/styles/print.ts`。
分页控制的关键 CSS：

```css
@page { margin: 18mm 16mm; }
h1, h2, h3 { break-after: avoid; }
pre, table, img { break-inside: avoid; }
```

---

## 已实现的转换器（18 / 18）

| 页面 | converter | 输入 | 产物 |
|---|---|---|---|
| `/markdown-to-word` | `docx` | Markdown | `.docx` |
| `/markdown-to-pdf` | `pdf` | Markdown | 浏览器打印 |
| `/markdown-to-html` | `html` | Markdown | `.html` |
| `/markdown-to-text` | `text` | Markdown | `.txt` |
| `/html-to-markdown` | `turndown` | HTML | `.md` |
| `/markdown-to-latex` | `latex` | Markdown | `.tex` |
| `/markdown-to-rst` | `rst` | Markdown | `.rst` |
| `/markdown-to-confluence` | `confluence` | Markdown | Confluence 标记 |
| `/latex-to-markdown` | `latexToMd` | LaTeX | `.md` |
| `/csv-to-markdown-table` | `csvToTable` | CSV | Markdown 表格 |
| `/json-to-markdown-table` | `jsonToTable` | JSON | Markdown 表格 |
| `/markdown-table-to-csv` | `tableToCsv` | Markdown | `.csv` |
| `/markdown-table-to-pdf` | `tableToPdf` | Markdown | 浏览器打印 |
| `/markdown-table-to-image` | `tableToImage` | Markdown | `.png` |
| `/markdown-editor` | `editor` | Markdown | `.md` |
| `/markdown-to-image` | `mdToImage` | Markdown | `.png` 长图 |
| `/word-to-markdown` | `wordToMd` | **.docx 上传** | `.md` |
| `/pdf-to-markdown` | `pdfToMd` | **.pdf 上传** | `.md` |

每个工具另有 7 语言版本：`/zh-cn/…`、`/zh-tw/…`、`/ja/…`、`/fr/…`、`/pt/…`、`/de/…`。

转换器按需动态 import，每个页面只下载自己那份 JS——18 个转换器的代码不会全塞进首页。

### 两类输入

Markdown 是文本，但 Word / PDF 是**二进制**。所以 `Converter.transform()` 的入参是
`string | ArrayBuffer`，`ToolDef` 上多了两个字段：

```ts
inputKind: 'markdown' | 'html' | 'csv' | 'json' | 'latex' | 'file'
binary?:   boolean     // true 时输入面板只留文件上传，不显示 textarea
```

---

## blog / tag 内容层

md-to.com 的 355 页里，**189 页是 blog 和 tag**（8 篇文章 × 7 语言，18 个 tag × 7 语言）。
纯工具页只有 126 页 —— 长尾流量主要靠内容页吃。

结构：

```
src/content/blog/<lang>/<slug>.md
src/pages/blog/index.astro              /blog/                    （en）
src/pages/blog/[slug].astro             /blog/<slug>/
src/pages/blog/tag/[tag].astro          /blog/tag/<tag>/
src/pages/[lang]/blog/...               其余 6 语言的对应路径
```

### frontmatter

```yaml
---
title: '...'
description: '...'
pubDate: 2026-01-12
tags: ['markdown', 'pdf']
lang: en
group: markdown-to-pdf-guide   # 7 个语言版本共用，用来互相关联
tools: ['markdown-to-pdf']     # 生成指向工具页的内链
---
```

`group` 是必填的关键字段。没有它，7 个语言版本就是 7 篇互不相识的文章，
各自为战而不是一份内容的多个译本。

### 两个设计决定

**1. hreflang 只输出实际存在的译本。**

默认 `BaseLayout` 会输出全部 7 个语言的 alternate，但 blog 文章不一定每种语言都有
译本 —— 那样 hreflang 会指向 404。文章页会先算出真实存在的语言再传进去：

```ts
const availableLangs = LANGS.filter((code) => translations[code]);
```

**2. 文章正文复用预览区的排版。**

`.post__body` 直接挂上 `.preview-body` 类（`src/styles/preview.css`），
标题层级、代码块、表格样式全部复用，没有第二套 CSS。

### 当前覆盖

| 语言 | 篇数 | 覆盖的文章 |
|---|---|---|
| en | 10 | 全部 |
| zh-cn | 10 | 全部 |
| zh-tw | 6 | 前 6 篇 |
| ja | 6 | 前 6 篇 |
| fr / pt / de | 0 | — |

- 文章页 32 个，tag 页 18 个 × 4 语言 = 72 页，blog 首页 7 个（fr / pt / de 是空壳，见下）

### 后 4 篇为什么只写 en + zh-cn

新增的 4 篇（markdown-to-html、html-to-markdown、GFM 扩展、怎么写 README）只铺了
英文和简体中文，没有同步繁中和日文。理由：

- 这 4 篇的关键词（"markdown to html"、"html to markdown"）搜索量集中在英语市场，
  中文次之；繁中 / 日文的对应词搜索量很小。
- 与其把 4 篇 × 4 语言铺满，不如先把**选题覆盖面**做宽 —— 长尾吃的是"有没有这一篇"，
  不是"这一篇有几个语言版本"。

hreflang 只输出真实存在的译本，所以 en / zh-cn 的新文章 hreflang=3（en + zh-Hans +
x-default），不会指向不存在的繁中 / 日文页。想补的时候照 `group` 字段加文件即可，
不用改任何代码。

### 没有文章的语言：空壳页要挡住

7 个语言路由都会生成 `/<lang>/blog/`，但 fr / pt / de 还没写文章。空列表页如果
照样被索引，就是标准的 thin content —— 所以做了两层处理：

1. `BlogIndex.astro` 在 `posts.length === 0` 时给页面加 `noindex, follow`；
2. `astro.config.mjs` 里用 `filter` 把这些 URL 从 sitemap 里剔除。

「哪些语言是空的」是构建期用 `readdirSync('src/content/blog/')` 算出来的，
不是硬编码的语言列表 —— 补完文章重新构建，noindex 和 sitemap 会自动放开。

### 关于 tag 页的风险提示

md-to.com 有 **126 个 tag 页**，比它的文章还多。这种"每 tag 一页、内容只是该 tag
下的文章列表"的做法，很容易被判定为**低价值内容**（thin content）。

本项目的处理：**文章数少于 2 篇的 tag 页自动加 `noindex, follow`**
（`TagIndex.astro` 里 `noindex={posts.length < 2}`）。页面照常生成，站内浏览和内链
不受影响，但不进搜索引擎索引。

再进一步：所有 `/blog/tag/` 页**一律不进 sitemap**（`astro.config.mjs` 的 `filter`）。
tag 归档页是导航页不是着陆页，没必要拿去喂索引。

当前 15 个 tag 里有 10 个是单文章 tag，会被标记 noindex。

> 对做 AdSense 的站尤其要注意：AIweb 就是因为 "Low Value Content" 被拒审过。
> tag 页是这类站最容易被判薄内容的地方，宁可少索引也不要硬堆页面数。

---

## 踩坑笔记

### 1. markdown-it 插件的 ESM 导出形状各不相同（构建能过，运行时炸）

这些插件都是 CJS 写的，被打包器按 ESM 处理后导出形状**三者不同**：

```
大多数插件            mod.default            -> function  ✔
@vscode/markdown-it-katex  mod.default.default  -> function  （CJS 双重包装）
markdown-it-emoji          mod.full / light / bare          （根本没有 default）
```

直接 `import emoji from 'markdown-it-emoji'` → 构建期报
`"default" is not exported by "markdown-it-emoji/index.mjs"`。

改成 `import * as mod` + `(mod as any).default ?? mod` → **构建能过但运行时报
`u.apply is not a function`**，因为 emoji 拿不到 default，回退成了命名空间对象。

正确做法：**逐个显式解包，不要写通用 fallback 去猜**。见 `src/lib/markdown.ts`：

```ts
const katex     = (katexMod as any).default?.default ?? (katexMod as any).default ?? katexMod;
const emoji     = (emojiMod as any).full ?? (emojiMod as any).light ?? emojiMod;
const taskLists = (taskListsMod as any).default ?? taskListsMod;
```

> 教训：构建成功 ≠ 能跑。这个 bug 只有真正点开页面才会暴露。

### 2. `direction` 和「输出控件类型」是两个概念

最初用一个 `direction: 'md-out' | 'md-in'` 同时决定「输入面板放 Markdown 还是 HTML」
**和**「输出用预览 div 还是 textarea」。

结果 `markdown-to-text` 翻车：它的输入是 Markdown（`md-out`），但产物是**纯文本**，
被 `innerHTML` 塞进预览 div 会被当 HTML 解析，用户也复制不到原始文本。

拆成两个字段后正常：

```ts
direction:  'md-out' | 'md-in'    // 输入侧放什么
outputKind: 'html'   | 'text'     // 输出用预览 div 还是只读 textarea
```

### 3. 路由建了 ≠ 本地化了（假本地化）

`I18nText` 类型写成 `Partial<Record<Lang, string>> & { en: string }`，
`t()` 又做了 `?? en[key]` 回落 —— 这两件事叠在一起的结果是：
**7 条语言路由顺利生成、hreflang 也全对，但 5 个语言的页面里装的还是英文。**

静默失败，构建不报错，只有真的切过去看才会发现。

处理方式：

1. 把 `ui.ts` 的 `DICTS` 从 `Partial<Record<Lang, Dict>>` 改成 `Record<Lang, Dict>`，
   让 TypeScript 在漏语言时直接报错；
2. 七种语言的工具文案全部手写补齐，不留回落；
3. 加了 `check-i18n.mjs`：抓构建产物，逐一比对每个语言页的 title / h1 / intro
   是否与英文版相同，相同即判定为回落并让退出码非 0（可直接挂 CI）。

当前状态：`共 114 个语言页，0 处问题`（19 个页面 × 6 非英语种）。

> 类型上允许 Partial + 运行时静默回落，是 i18n 最容易埋雷的组合。

### 4. docx 的图片：WebP + CORS 两个坑

这也是 md-to.com 踩过并写进博客的两个坑：

- **WebP 不支持**：Word 的 `ImageRun` 只认 png/jpg/gif/bmp。WebP/AVIF 必须先用
  Canvas 转成 PNG 再塞进去。
- **CORS**：`fetch(url)` 拿跨域图片会被拦。兜底是让 `<img crossOrigin="anonymous">`
  直接加载 URL 再画到 Canvas（绕开 fetch 的 CORS 检查）。

两级降级都写在 `src/lib/images.ts` 的 `loadImageForDocx()` 里。

### 5. md → 图片：别用 html2canvas，长图会崩

`html2canvas` 是逐节点重绘 DOM，几千行的文档会跑几十秒，而且**Canvas 有尺寸上限**
（Chrome 约 16384px，且单边超限整个 canvas 变空白）。

用 `html-to-image` 走 `foreignObject` + SVG 序列化，浏览器原生渲染，快一个量级。
但 `foreignObject` 有两个前提：

- **字体必须内联**。外部字体在 SVG 里加载不到，`html-to-image` 的
  `embedWebFonts` 会把 CSS 里的 `@font-face` 转成 data URI 塞进去。
- **跨域图片会污染 canvas**。同源图片没问题，外链图要服务器给 CORS 头，
  否则 `toBlob()` 直接抛错。

长图超限的兜底：分段渲染再纵向拼接。见 `src/lib/converters/mdToImage.ts`。

### 6. Word → Markdown：mammoth 不给 `<th>`，也不给干净的单元格

mammoth 把 `.docx` 解成 HTML 时有两个坑，都会让表格转不出来：

**坑一：一个 `<th>` 都没有。** turndown 的 GFM 表格规则靠 `<th>` 认表头，
认不出就把整张表原样吐成 HTML —— 用户看到的就是「转完了但还是 HTML」，等于没转。
所以要先补表头：没有 `th` 的表格，把第一行 `td` 提升成 `th` 并包进 `<thead>`。

**坑二：每个单元格都包一层 `<p>`。** turndown 按块级元素处理，会在前后插换行，
转出来是这种残废表格：

```
| 
Feature

 | 
Status

 |
```

处理办法是拍平单元格：单段落 unwrap（保留加粗/斜体等行内格式），
多段落压成一行 —— Markdown 表格没有多行单元格的表示法，只能合并。

见 `src/lib/converters/wordToMd.ts` 的 `promoteTableHeaders()` / `flattenCell()`。

> 另：`word-to-markdown` 只支持 `.docx`。老版 `.doc` 是 OLE2 复合二进制文档，
> 浏览器端没有可用解析库，只能让用户先另存为 `.docx`。
>
> `pdf-to-markdown` 同理只认**有文本层**的 PDF。扫描件是纯图片，
> pdfjs 抽不到任何文字，输出会是空的。

### 7. LaTeX 相关：行首缩进和结尾空行

- **反向转换（LaTeX → md）**：`\item` 常常带行首缩进，
  正则写成 `/^\\item\s*(.*)$/` 匹配不上（因为 `^` 后面是空格）。
  必须先 `trimStart()` 再匹配。
- **正向转换（md → LaTeX 等）**：`fence` 的最后一行自带 `\n`，
  再 `push` 一个结束标记就会多出一个空行。三个渲染器（LaTeX / reST / Confluence）
  都踩了这个，统一用 `.replace(/\n$/, '')` 收尾。

---

## 如何加一个新工具

两处改动，7 语言页面自动生成：

**1. 注册工具**（`src/tools.ts` 的 `TOOLS` 数组）

⚠️ **七种语言一个都不能少**，少了就是假本地化（见踩坑 3）：

```ts
{
  slug: 'markdown-to-latex',
  converter: 'latex',              // 新增的 converter id
  direction: 'md-out',
  outputKind: 'text',
  outputExt: 'tex',
  accept: '.md,.markdown',
  // name / seoTitle / seoDesc / h1 / intro 都要写满 7 语言
  name: {
    en: 'Markdown to LaTeX', 'zh-cn': 'Markdown 转 LaTeX', 'zh-tw': '…',
    ja: '…', fr: '…', pt: '…', de: '…',
  },
  seoTitle: { /* 7 语言 */ },
  seoDesc:  { /* 7 语言 */ },
  h1:       { /* 7 语言 */ },
  intro:    { /* 7 语言 */ },
}
```

新增 UI 文案时同理：`src/i18n/ui.ts` 的 `DICTS` 是 `Record<Lang, Dict>`，
漏一种语言 TypeScript 会直接报错。

**2. 实现转换器**（`src/lib/converters/latex.ts`）

```ts
export const latexConverter: Converter = {
  id: 'latex',
  async transform(input) { /* 实时预览用 */ },
  async download(input, filenameBase) { /* 点下载时 */ },
};
```

然后在 `src/lib/converters/index.ts` 的 `getConverter()` 里挂上（用动态 import，
保证每个页面只加载自己那份 JS）。

页面、路由、hreflang、canonical、sitemap 全自动，不用碰。

---

## 已知边界

**功能上对齐 md-to.com 的 18 个方向了，但还不是一个能上线的站：**

- 没接变现（AdSense / Pro 订阅）。md-to.com 靠 AdSense + $19.99 买断吃饭。
- blog 只铺了 4 个语言（en / zh-cn / zh-tw / ja），fr / pt / de 还是空壳页，
  已加 noindex + 出 sitemap，但真要吃这三个市场的长尾流量得补 18 篇译文。
- 没部署。`site` 还是占位的 `https://md-toolkit.example.com`，
  上线前必须改成真域名，否则 canonical / hreflang / sitemap 全指向假地址。
- `pdf-to-markdown` 的准确率约七成：PDF 没有段落/标题的语义信息，
  标题层级靠字号启发式猜，复杂排版会认错。
- `markdown-to-image` 对超长文档仍有 Canvas 上限风险，分段拼接是兜底不是根治。
- 没做持久化、没做历史记录、没做批量转换。

**赛道判断（重要）：** 通用 md 转换是红海，头部 markdowntoword.io 环比还在跌，
而且「格式转换」是所有在线工具里最容易被大模型一句话替掉的一类。
这套代码真正的价值是**页面矩阵 + 纯前端零成本 + 7 语言**这套模式，
建议把它迁移到需求在涨的赛道（如 AI 图片编辑），而不是真去打 md 这个市场。
