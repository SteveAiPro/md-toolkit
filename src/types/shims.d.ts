/** mammoth 的浏览器打包版是 UMD，官方不发类型 */
declare module 'mammoth/mammoth.browser.js' {
  interface MammothMessage {
    type: string;
    message: string;
  }
  const mammoth: {
    convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: MammothMessage[] }>;
  };
  export default mammoth;
}

/** Vite 的 ?url 后缀，用来拿 worker 的静态资源地址 */
declare module '*?url' {
  const src: string;
  export default src;
}
