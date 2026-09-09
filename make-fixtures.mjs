import fs from 'node:fs';
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';

const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({ text: 'Hello From Word', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('This paragraph proves the text layer survived the round trip.'),
        new Paragraph({ text: 'Second Heading', heading: HeadingLevel.HEADING_2 }),
        new Table({
          rows: [
            new TableRow({
              children: [new TableCell({ children: [new Paragraph('Feature')] }), new TableCell({ children: [new Paragraph('Status')] })],
            }),
            new TableRow({
              children: [new TableCell({ children: [new Paragraph('Word export')] }), new TableCell({ children: [new Paragraph('Shipped')] })],
            }),
          ],
        }),
      ],
    },
  ],
});

const dir = new URL('./.fixtures/', import.meta.url);
fs.mkdirSync(dir, { recursive: true });

// e2e 用的二进制样本：Word 转 Markdown / PDF 转 Markdown 要上传真文件
const docxOut = new URL('word-sample.docx', dir);
fs.writeFileSync(docxOut, await Packer.toBuffer(doc));
console.log('docx written:', fs.statSync(docxOut).size, 'bytes');

/**
 * 手写一个极简 PDF，只要带文本层 —— pdfjs 抽的就是文本层。
 * 不用 cupsfilter 是因为它是 macOS 专用命令，换台机器就跑不了。
 * xref 偏移必须逐个算准，否则 pdfjs 会报 "Invalid PDF structure"。
 */
function buildPdf(lines) {
  const text = (s) => s.replace(/([()\\])/g, '\\$1');
  const content = lines
    .map((l, i) => `BT /F1 ${i === 0 ? 22 : 12} Tf 72 ${720 - i * 32} Td (${text(l)}) Tj ET`)
    .join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });

  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

const pdfOut = new URL('pdf-sample.pdf', dir);
fs.writeFileSync(
  pdfOut,
  buildPdf([
    'Hello From PDF',
    '',
    'This paragraph proves the text layer can be extracted.',
  ]),
);
console.log('pdf  written:', fs.statSync(pdfOut).size, 'bytes');
