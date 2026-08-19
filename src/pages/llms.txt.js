import { getCollection } from 'astro:content';
import { site, categories } from '../config';

// llms.txt — Markdown guide for AI agents (https://llmstxt.org)
export async function GET() {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.pubDate ?? 0) - new Date(a.data.pubDate ?? 0)
  );

  let md = `# ${site.name}\n\n`;
  const summary = site.description || site.tagline || '';
  if (summary) md += `> ${summary}\n\n`;
  if (site.tagline && site.tagline !== summary) md += `${site.tagline}\n\n`;

  if (Array.isArray(categories) && categories.length) {
    md += `## Chuyên mục\n\n`;
    for (const c of categories) {
      md += `- [${c.name}](${site.url}/blog/category/${c.slug}/)${c.desc ? ': ' + c.desc : ''}\n`;
    }
    md += `\n`;
  }

  md += `## Bài viết\n\n`;
  for (const p of posts) {
    md += `- [${p.data.title}](${site.url}/blog/${p.slug}/)\n`;
  }

  md += `\n## Liên kết chính\n\n`;
  md += `- [Trang chủ](${site.url}/)\n`;
  md += `- [Tất cả bài viết](${site.url}/blog/)\n`;

  return new Response(md, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
