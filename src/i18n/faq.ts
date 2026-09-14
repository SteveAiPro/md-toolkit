import type { Lang } from './index.ts';

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * 首页 FAQ 文案。
 *
 * 为什么单独成文件：FAQ 是成组的结构化内容（标题 + 问答数组），塞进 ui.ts 那种
 * key->string 扁平字典反而要拆成一堆 faq.q1 / faq.a1，更难维护。
 *
 * 为什么问题和工具页不一样：工具页（ToolPage）每个页面都有 4 个 FAQ
 * （隐私 / 是否要注册 / 手机能用吗 / PDF 怎么存）。首页如果再问一遍同样的，
 * 就是站内内容自我重复。这里刻意改成「站点级 + 科普向」的 4 问，与工具页互补：
 * 什么是 Markdown / 格式保留吗 / 有大小限制吗 / 能反向转回 Markdown 吗。
 *
 * 值统一用双引号 —— 法语、葡语答案里有撇号（s'exécute / d'água），单引号得转义。
 */
const FAQS: Record<Lang, { title: string; items: FaqItem[] }> = {
  en: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'What is Markdown?',
        a: 'Markdown is a lightweight markup language for writing formatted text with plain-text symbols. It stays readable even without rendering, which is why it is widely used for README files, documentation, notes and blog posts.',
      },
      {
        q: 'Will the conversion keep my original formatting?',
        a: 'Headings, lists, tables, code blocks, links and emphasis are preserved. Complex layouts such as multi-column designs or embedded scripts may be simplified, because each target format describes documents differently.',
      },
      {
        q: 'Is there a file size or quantity limit?',
        a: 'There is no artificial cap. The practical limit is your own device memory, since everything is processed locally instead of on a server.',
      },
      {
        q: 'Can I convert other formats back into Markdown?',
        a: 'Yes. Besides exporting Markdown, the toolkit also converts HTML, Word documents, PDF files, and CSV or JSON tables back into Markdown.',
      },
    ],
  },
  'zh-cn': {
    title: '常见问题',
    items: [
      {
        q: '什么是 Markdown？',
        a: 'Markdown 是一种轻量级标记语言，用纯文本符号就能写出带格式的文档。它不渲染也易读，因此被广泛用于 README、技术文档、笔记和博客。',
      },
      {
        q: '转换会保留原有格式吗？',
        a: '标题、列表、表格、代码块、链接和强调都会保留。但多栏排版、嵌入脚本这类复杂布局可能被简化，因为每种目标格式描述文档的方式不同。',
      },
      {
        q: '有文件大小或数量限制吗？',
        a: '没有人为限制。实际上限取决于你自己设备的内存，因为全部在本地处理，不经过服务器。',
      },
      {
        q: '可以把其他格式转回 Markdown 吗？',
        a: '可以。除了把 Markdown 导出成各种格式，也支持把 HTML、Word 文档、PDF 以及 CSV / JSON 表格反向转成 Markdown。',
      },
    ],
  },
  'zh-tw': {
    title: '常見問題',
    items: [
      {
        q: '什麼是 Markdown？',
        a: 'Markdown 是一種輕量級標記語言，用純文字符號就能寫出帶格式的文件。它不渲染也易讀，因此被廣泛用於 README、技術文件、筆記和部落格。',
      },
      {
        q: '轉換會保留原有格式嗎？',
        a: '標題、清單、表格、程式碼區塊、連結和強調都會保留。但多欄排版、嵌入指令碼這類複雜版面可能被簡化，因為每種目標格式描述文件的方式不同。',
      },
      {
        q: '有檔案大小或數量限制嗎？',
        a: '沒有人為限制。實際上限取決於你自己裝置的記憶體，因為全部在本機處理，不經過伺服器。',
      },
      {
        q: '可以把其他格式轉回 Markdown 嗎？',
        a: '可以。除了把 Markdown 匯出成各種格式，也支援把 HTML、Word 文件、PDF 以及 CSV / JSON 表格反向轉成 Markdown。',
      },
    ],
  },
  ja: {
    title: 'よくある質問',
    items: [
      {
        q: 'Markdown とは何ですか？',
        a: 'Markdown は、プレーンテキストの記号で書式付き文書を書ける軽量マークアップ言語です。レンダリングしなくても読みやすいため、README、ドキュメント、メモ、ブログ記事などで広く使われています。',
      },
      {
        q: '変換しても元の書式は保持されますか？',
        a: '見出し、リスト、表、コードブロック、リンク、強調は保持されます。ただし段組みレイアウトや埋め込みスクリプトなどの複雑な構成は簡略化される場合があります。出力先形式が文書を表現する方法が異なるためです。',
      },
      {
        q: 'ファイルサイズや回数の制限はありますか？',
        a: '人為的な上限はありません。実質的な上限はお使いの端末のメモリで、サーバーではなくローカルで処理されるためです。',
      },
      {
        q: '他の形式から Markdown に戻せますか？',
        a: 'はい。Markdown からの書き出しに加えて、HTML、Word 文書、PDF、そして CSV / JSON の表を Markdown に変換できます。',
      },
    ],
  },
  fr: {
    title: 'Questions fréquentes',
    items: [
      {
        q: "Qu'est-ce que le Markdown ?",
        a: "Le Markdown est un langage de balisage léger qui permet de rédiger du texte mis en forme avec de simples symboles. Il reste lisible même sans rendu, ce qui explique son usage massif pour les README, la documentation, les notes et les articles de blog.",
      },
      {
        q: 'La conversion conserve-t-elle la mise en forme ?',
        a: "Les titres, listes, tableaux, blocs de code, liens et emphases sont conservés. En revanche, les mises en page complexes comme les colonnes ou les scripts intégrés peuvent être simplifiées, car chaque format cible décrit les documents différemment.",
      },
      {
        q: 'Y a-t-il une limite de taille ou de nombre de fichiers ?',
        a: "Il n'y a aucune limite artificielle. La limite pratique est la mémoire de votre appareil, puisque tout est traité localement et non sur un serveur.",
      },
      {
        q: "Puis-je convertir d'autres formats vers Markdown ?",
        a: "Oui. En plus des exportations depuis Markdown, l'outil convertit également le HTML, les documents Word, les PDF ainsi que les tableaux CSV et JSON vers Markdown.",
      },
    ],
  },
  pt: {
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'O que é Markdown?',
        a: 'Markdown é uma linguagem de marcação leve que permite escrever texto formatado com símbolos simples. Continua legível mesmo sem renderização, por isso é muito usada em READMEs, documentação, notas e posts de blog.',
      },
      {
        q: 'A conversão mantém a formatação original?',
        a: 'Títulos, listas, tabelas, blocos de código, links e ênfase são preservados. Layouts complexos como colunas múltiplas ou scripts incorporados podem ser simplificados, pois cada formato de destino descreve documentos de outra forma.',
      },
      {
        q: 'Existe limite de tamanho ou de quantidade?',
        a: 'Não há limite artificial. O limite prático é a memória do seu dispositivo, já que tudo é processado localmente e não em um servidor.',
      },
      {
        q: 'Posso converter outros formatos de volta para Markdown?',
        a: 'Sim. Além de exportar a partir de Markdown, a ferramenta também converte HTML, documentos Word, PDF e tabelas CSV e JSON para Markdown.',
      },
    ],
  },
  de: {
    title: 'Häufige Fragen',
    items: [
      {
        q: 'Was ist Markdown?',
        a: 'Markdown ist eine schlanke Auszeichnungssprache, mit der sich formatierter Text mit einfachen Symbolen schreiben lässt. Sie bleibt auch ohne Darstellung lesbar und wird daher für README-Dateien, Dokumentation, Notizen und Blogartikel verwendet.',
      },
      {
        q: 'Bleibt die ursprüngliche Formatierung erhalten?',
        a: 'Überschriften, Listen, Tabellen, Codeblöcke, Links und Hervorhebungen bleiben erhalten. Komplexe Layouts wie mehrspaltige Designs oder eingebettete Skripte können vereinfacht werden, da jedes Zielformat Dokumente anders beschreibt.',
      },
      {
        q: 'Gibt es eine Größen- oder Mengenbegrenzung?',
        a: 'Es gibt keine künstliche Grenze. Die praktische Grenze ist der Speicher Ihres Geräts, da alles lokal statt auf einem Server verarbeitet wird.',
      },
      {
        q: 'Kann ich andere Formate zurück in Markdown umwandeln?',
        a: 'Ja. Neben dem Export aus Markdown heraus konvertiert das Werkzeug auch HTML, Word-Dokumente, PDF sowie CSV- und JSON-Tabellen nach Markdown.',
      },
    ],
  },
};

export function getFaq(lang: Lang) {
  return FAQS[lang];
}
