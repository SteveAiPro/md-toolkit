/**
 * 结构化数据（JSON-LD）公共片段。
 *
 * 用法：在页面里构造一个 @graph 数组，把这里返回的节点塞进去，
 * 由 BaseLayout 统一输出成 <script type="application/ld+json">。
 * 每个节点都不带 @context —— 上下文由外层的 @graph 容器统一声明。
 */

/** 面包屑。item 必须是绝对 URL，否则 Google 读不出来。 */
export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      item: entry.url,
    })),
  };
}

/** 把若干节点打包成一个合法的 @graph 文档 */
export function graph(...nodes: Record<string, unknown>[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
