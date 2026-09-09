import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://md-toolkit.example.com')).href.replace(/\/$/, '');
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
