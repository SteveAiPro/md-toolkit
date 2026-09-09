import { renderMarkdown } from '../markdown.ts';
import { sanitize } from '../sanitize.ts';
import { downloadText } from '../download.ts';
import { requireText, slugifyFilename, type Converter } from './types.ts';

const DOCUMENT_TEMPLATE = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head>
<body>
${body}
</body>
</html>
`;

export const htmlConverter: Converter = {
  id: 'html',

  async transform(input) {
    return sanitize(renderMarkdown(requireText(input)));
  },

  async download(input, filenameBase) {
    const source = requireText(input);
    const title = slugifyFilename(source, filenameBase);
    downloadText(DOCUMENT_TEMPLATE(title, renderMarkdown(source)), `${title}.html`, 'text/html');
  },
};
