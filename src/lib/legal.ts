import type { Lang } from '../i18n/index.ts';

/**
 * privacy / terms 的 7 语言文案。
 *
 * 为什么不用 Markdown collection：这两个页面是 AdSense 审核要看的，
 * 漏一种语言就会让 6 个语言的 footer 链到英文页 —— 之前就是这么错的。
 * 用 Record<Lang, …> 让 TypeScript 在缺语言时直接编译失败。
 *
 * `a` 字段允许少量 HTML（如 <code>），渲染时用 set:html。
 */
export interface LegalItem {
  q: string;
  a: string;
}

export interface LegalContent {
  title: string;
  description: string;
  h1: string;
  lead: string;
  updated: string;
  items: LegalItem[];
}

export const PRIVACY: Record<Lang, LegalContent> = {
  en: {
    title: 'Privacy Policy | MD Toolkit',
    description:
      'MD Toolkit processes every conversion locally in your browser. Nothing is uploaded to a server.',
    h1: 'Privacy Policy',
    lead: 'Short version: your documents never leave your device.',
    updated: 'Last updated: September 9, 2026',
    items: [
      {
        q: 'Do you upload my files?',
        a: 'No. Every conversion runs in your browser with JavaScript. Content you paste or drop into the editor is processed on your device and is never sent to a server. Open devtools and watch the network panel if you want to verify it — there should be no request carrying your text.',
      },
      {
        q: 'What is stored locally?',
        a: 'The editor keeps a draft in <code>localStorage</code> so a reload does not lose your work, and remembers your theme and language preference. Clearing site data removes all of it. None of it leaves your browser.',
      },
      {
        q: 'Third-party scripts',
        a: 'A production deployment usually adds analytics and advertising scripts. If they are enabled, they are disclosed here and in the cookie banner — that is also what AdSense requires. This build ships with no analytics and no advertising.',
      },
    ],
  },
  'zh-cn': {
    title: '隐私政策 | MD Toolkit',
    description: 'MD Toolkit 的每一次转换都在你自己的浏览器里完成，不上传任何内容到服务器。',
    h1: '隐私政策',
    lead: '简短版：你的文档不会离开你的设备。',
    updated: '最后更新：2026 年 9 月 9 日',
    items: [
      {
        q: '你们会上传我的文件吗？',
        a: '不会。所有转换都由 JavaScript 在你的浏览器里完成。你粘贴或拖进编辑器的内容只在本地设备上处理，从不发往服务器。想验证的话打开开发者工具看 network 面板 —— 不应该有任何携带你文本的请求。',
      },
      {
        q: '本地存了什么？',
        a: '编辑器会把草稿存在 <code>localStorage</code> 里，刷新页面不会丢。主题和语言偏好也记在本地。清除站点数据即可全部移除。这些数据同样不会离开你的浏览器。',
      },
      {
        q: '第三方脚本',
        a: '正式部署时通常会接入统计和广告脚本。一旦启用，我们会在这里和 cookie 提示条里说明 —— 这也是 AdSense 的要求。当前这个版本没有接入任何统计和广告。',
      },
    ],
  },
  'zh-tw': {
    title: '隱私政策 | MD Toolkit',
    description: 'MD Toolkit 的每一次轉換都在你自己的瀏覽器裡完成，不上傳任何內容到伺服器。',
    h1: '隱私政策',
    lead: '簡短版：你的文件不會離開你的裝置。',
    updated: '最後更新：2026 年 9 月 9 日',
    items: [
      {
        q: '你們會上傳我的檔案嗎？',
        a: '不會。所有轉換都由 JavaScript 在你的瀏覽器裡完成。你貼上或拖進編輯器的內容只在本機裝置上處理，從不送往伺服器。想驗證的話請打開開發者工具看 network 面板 —— 不應該有任何攜帶你文字的請求。',
      },
      {
        q: '本機存了什麼？',
        a: '編輯器會把草稿存在 <code>localStorage</code> 裡，重新載入頁面不會遺失。主題與語言偏好也記在本機。清除網站資料即可全部移除。這些資料同樣不會離開你的瀏覽器。',
      },
      {
        q: '第三方指令碼',
        a: '正式部署時通常會接入分析與廣告指令碼。一旦啟用，我們會在這裡和 cookie 提示條中說明 —— 這也是 AdSense 的要求。目前這個版本沒有接入任何分析與廣告。',
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー | MD Toolkit',
    description:
      'MD Toolkit の変換はすべてブラウザー内で行われます。サーバーにアップロードされるものはありません。',
    h1: 'プライバシーポリシー',
    lead: '要するに：あなたのドキュメントが端末から外に出ることはありません。',
    updated: '最終更新：2026 年 9 月 9 日',
    items: [
      {
        q: 'ファイルはアップロードされますか？',
        a: 'いいえ。すべての変換はブラウザー上の JavaScript で実行されます。エディターに貼り付けたりドロップした内容は端末内で処理され、サーバーに送信されることはありません。devtools の network パネルで確認できます。あなたのテキストを含むリクエストは存在しないはずです。',
      },
      {
        q: 'ローカルに保存されるものは？',
        a: 'リロードで作業が失われないよう、エディターは下書きを <code>localStorage</code> に保存します。テーマと言語の設定もここに入ります。サイトデータを削除すればすべて消えます。これらがブラウザーの外に出ることはありません。',
      },
      {
        q: 'サードパーティースクリプト',
        a: '本番運用では分析や広告のスクリプトを入れるのが一般的です。有効にした場合はここと cookie バナーで開示します（AdSense の要件でもあります）。このビルドには分析も広告も含まれていません。',
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité | MD Toolkit',
    description:
      'MD Toolkit effectue chaque conversion localement dans votre navigateur. Rien n’est envoyé à un serveur.',
    h1: 'Politique de confidentialité',
    lead: 'En bref : vos documents ne quittent jamais votre appareil.',
    updated: 'Dernière mise à jour : 9 septembre 2026',
    items: [
      {
        q: 'Téléversez-vous mes fichiers ?',
        a: 'Non. Chaque conversion s’exécute dans votre navigateur en JavaScript. Le contenu que vous collez ou déposez dans l’éditeur est traité sur votre appareil et n’est jamais envoyé à un serveur. Ouvrez les outils de développement et regardez l’onglet réseau pour le vérifier : aucune requête ne doit contenir votre texte.',
      },
      {
        q: 'Qu’est-ce qui est stocké localement ?',
        a: 'L’éditeur conserve un brouillon dans <code>localStorage</code> pour qu’un rechargement ne perde pas votre travail, ainsi que vos préférences de thème et de langue. Vider les données du site supprime tout. Rien ne sort de votre navigateur.',
      },
      {
        q: 'Scripts tiers',
        a: 'Un déploiement en production ajoute généralement des scripts d’analyse et de publicité. S’ils sont activés, ils sont mentionnés ici et dans la bannière de cookies — c’est aussi ce qu’exige AdSense. Cette version n’inclut aucune analyse ni publicité.',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade | MD Toolkit',
    description:
      'O MD Toolkit faz todas as conversões localmente no seu navegador. Nada é enviado para um servidor.',
    h1: 'Política de Privacidade',
    lead: 'Versão curta: seus documentos nunca saem do seu dispositivo.',
    updated: 'Última atualização: 9 de setembro de 2026',
    items: [
      {
        q: 'Vocês enviam meus arquivos?',
        a: 'Não. Todas as conversões rodam no seu navegador com JavaScript. O conteúdo que você cola ou solta no editor é processado no seu dispositivo e nunca é enviado a um servidor. Abra o devtools e observe o painel de rede para conferir: não deve haver nenhuma requisição com o seu texto.',
      },
      {
        q: 'O que fica armazenado localmente?',
        a: 'O editor guarda um rascunho no <code>localStorage</code> para que um recarregamento não perca o seu trabalho, além das suas preferências de tema e idioma. Limpar os dados do site remove tudo. Nada disso sai do seu navegador.',
      },
      {
        q: 'Scripts de terceiros',
        a: 'Uma implantação em produção normalmente adiciona scripts de análise e publicidade. Se forem ativados, eles serão informados aqui e no aviso de cookies — é também o que o AdSense exige. Esta versão não inclui análise nem publicidade.',
      },
    ],
  },
  de: {
    title: 'Datenschutzerklärung | MD Toolkit',
    description:
      'MD Toolkit führt jede Konvertierung lokal in Ihrem Browser aus. Nichts wird auf einen Server geladen.',
    h1: 'Datenschutzerklärung',
    lead: 'Kurzfassung: Ihre Dokumente verlassen Ihr Gerät nicht.',
    updated: 'Zuletzt aktualisiert: 9. September 2026',
    items: [
      {
        q: 'Laden Sie meine Dateien hoch?',
        a: 'Nein. Jede Konvertierung läuft mit JavaScript in Ihrem Browser. Inhalte, die Sie in den Editor einfügen oder dort ablegen, werden auf Ihrem Gerät verarbeitet und nie an einen Server gesendet. Öffnen Sie die Entwicklertools und schauen Sie in den Netzwerk-Tab — dort darf keine Anfrage mit Ihrem Text auftauchen.',
      },
      {
        q: 'Was wird lokal gespeichert?',
        a: 'Der Editor hält einen Entwurf im <code>localStorage</code>, damit ein Neuladen Ihre Arbeit nicht verliert, außerdem Ihre Einstellungen zu Theme und Sprache. Wer die Website-Daten löscht, entfernt alles. Nichts davon verlässt Ihren Browser.',
      },
      {
        q: 'Skripte von Drittanbietern',
        a: 'Ein Produktivbetrieb fügt üblicherweise Analyse- und Werbeskripte hinzu. Falls diese aktiviert werden, werden sie hier und im Cookie-Hinweis offengelegt — das verlangt auch AdSense. Dieser Build enthält weder Analyse noch Werbung.',
      },
    ],
  },
};

export const TERMS: Record<Lang, LegalContent> = {
  en: {
    title: 'Terms of Service | MD Toolkit',
    description: 'Terms for using the MD Toolkit online converters.',
    h1: 'Terms of Service',
    lead: 'Use it freely. Do not abuse it.',
    updated: 'Last updated: September 9, 2026',
    items: [
      {
        q: 'Service scope',
        a: 'The converters are provided as-is, free of charge, with no uptime guarantee. Output formatting can vary between browsers and document viewers — always check the result before you send it out.',
      },
      {
        q: 'Your content',
        a: 'You keep full ownership of everything you convert. Since processing happens locally, we never receive or store it. That also means we cannot recover a document you did not download.',
      },
      {
        q: 'Pro plans',
        a: 'There is no paid plan today. If one is introduced, billing, refunds and cancellation will be described here before any charging starts.',
      },
    ],
  },
  'zh-cn': {
    title: '服务条款 | MD Toolkit',
    description: 'MD Toolkit 在线转换器的使用条款。',
    h1: '服务条款',
    lead: '随便用，别滥用。',
    updated: '最后更新：2026 年 9 月 9 日',
    items: [
      {
        q: '服务范围',
        a: '所有转换器按现状免费提供，不保证可用性。产出格式在不同浏览器和文档查看器之间可能有差异 —— 发出去之前请务必自己先看一遍。',
      },
      {
        q: '你的内容',
        a: '你转换的一切内容，所有权完全归你。处理在本地完成，我们收不到也存不下。这也意味着如果你没下载，我们没法帮你找回。',
      },
      {
        q: '付费方案',
        a: '目前没有任何付费方案。将来如果推出，会在开始收费之前在这里写清楚计费、退款和取消方式。',
      },
    ],
  },
  'zh-tw': {
    title: '服務條款 | MD Toolkit',
    description: 'MD Toolkit 線上轉換器的使用條款。',
    h1: '服務條款',
    lead: '隨便用，別濫用。',
    updated: '最後更新：2026 年 9 月 9 日',
    items: [
      {
        q: '服務範圍',
        a: '所有轉換器依現狀免費提供，不保證可用性。產出格式在不同瀏覽器與文件檢視器之間可能有差異 —— 送出之前請務必自己先看過一遍。',
      },
      {
        q: '你的內容',
        a: '你轉換的一切內容，所有權完全歸你。處理在本機完成，我們收不到也存不下。這也代表如果你沒下載，我們無法幫你找回。',
      },
      {
        q: '付費方案',
        a: '目前沒有任何付費方案。日後若推出，會在開始收費之前於此寫明計費、退款與取消方式。',
      },
    ],
  },
  ja: {
    title: '利用規約 | MD Toolkit',
    description: 'MD Toolkit オンラインコンバーターの利用条件です。',
    h1: '利用規約',
    lead: '自由に使ってください。ただし乱用はしないでください。',
    updated: '最終更新：2026 年 9 月 9 日',
    items: [
      {
        q: 'サービスの範囲',
        a: '各コンバーターは現状のまま無料で提供され、稼働保証はありません。出力の書式はブラウザーやドキュメントビューアーによって異なる場合があります。送信する前に必ず結果を確認してください。',
      },
      {
        q: 'あなたのコンテンツ',
        a: '変換するコンテンツの権利はすべてあなたに帰属します。処理はローカルで行われるため、当方が受け取ることも保存することもありません。したがって、ダウンロードしなかったドキュメントを復元することもできません。',
      },
      {
        q: '有料プラン',
        a: '現在、有料プランはありません。将来導入する場合は、課金を開始する前に料金・返金・解約の条件をここに記載します。',
      },
    ],
  },
  fr: {
    title: 'Conditions d’utilisation | MD Toolkit',
    description: 'Conditions d’utilisation des convertisseurs en ligne MD Toolkit.',
    h1: 'Conditions d’utilisation',
    lead: 'Utilisez librement. N’en abusez pas.',
    updated: 'Dernière mise à jour : 9 septembre 2026',
    items: [
      {
        q: 'Portée du service',
        a: 'Les convertisseurs sont fournis en l’état, gratuitement et sans garantie de disponibilité. La mise en forme du résultat peut varier selon les navigateurs et les visionneuses de documents — vérifiez toujours le résultat avant de l’envoyer.',
      },
      {
        q: 'Votre contenu',
        a: 'Vous restez pleinement propriétaire de tout ce que vous convertissez. Le traitement étant local, nous ne recevons ni ne stockons rien. Cela signifie aussi que nous ne pouvons pas récupérer un document que vous n’avez pas téléchargé.',
      },
      {
        q: 'Offres payantes',
        a: 'Il n’existe aujourd’hui aucune offre payante. Si une offre voit le jour, la facturation, les remboursements et les conditions d’annulation seront décrits ici avant tout prélèvement.',
      },
    ],
  },
  pt: {
    title: 'Termos de Uso | MD Toolkit',
    description: 'Termos de uso dos conversores online do MD Toolkit.',
    h1: 'Termos de Uso',
    lead: 'Use à vontade. Só não abuse.',
    updated: 'Última atualização: 9 de setembro de 2026',
    items: [
      {
        q: 'Escopo do serviço',
        a: 'Os conversores são oferecidos no estado em que se encontram, gratuitamente e sem garantia de disponibilidade. A formatação do resultado pode variar entre navegadores e visualizadores de documentos — confira sempre o resultado antes de enviá-lo.',
      },
      {
        q: 'Seu conteúdo',
        a: 'Você mantém a propriedade total de tudo o que converte. Como o processamento é local, nunca recebemos nem armazenamos nada. Isso também significa que não conseguimos recuperar um documento que você não tenha baixado.',
      },
      {
        q: 'Planos pagos',
        a: 'Hoje não existe nenhum plano pago. Se um for criado, cobrança, reembolsos e cancelamento serão descritos aqui antes de qualquer cobrança.',
      },
    ],
  },
  de: {
    title: 'Nutzungsbedingungen | MD Toolkit',
    description: 'Nutzungsbedingungen für die Online-Konverter von MD Toolkit.',
    h1: 'Nutzungsbedingungen',
    lead: 'Nutzen Sie es frei. Missbrauchen Sie es nicht.',
    updated: 'Zuletzt aktualisiert: 9. September 2026',
    items: [
      {
        q: 'Umfang des Dienstes',
        a: 'Die Konverter werden wie besehen, kostenlos und ohne Verfügbarkeitsgarantie bereitgestellt. Die Formatierung des Ergebnisses kann zwischen Browsern und Dokumentenanzeigen abweichen — prüfen Sie das Ergebnis immer, bevor Sie es weitergeben.',
      },
      {
        q: 'Ihre Inhalte',
        a: 'Alles, was Sie konvertieren, bleibt vollständig Ihr Eigentum. Da die Verarbeitung lokal erfolgt, erhalten oder speichern wir nichts. Das heißt auch: Ein Dokument, das Sie nicht heruntergeladen haben, können wir nicht wiederherstellen.',
      },
      {
        q: 'Kostenpflichtige Pläne',
        a: 'Derzeit gibt es keinen kostenpflichtigen Plan. Falls einer eingeführt wird, werden Abrechnung, Erstattungen und Kündigung hier beschrieben, bevor Zahlungen erhoben werden.',
      },
    ],
  },
};
