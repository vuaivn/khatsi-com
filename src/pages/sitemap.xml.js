import { getCollection } from 'astro:content';
import { site, categories } from '../config';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const staticPaths = ['', 'blog', 'kinh-sach', 'phap-am', 'thuat-ngu', 'gioi-thieu', 'tim-kiem'];
  const urls = [];

  for (const p of staticPaths) {
    urls.push({ loc: `${site.url}/${p}`, priority: p === '' ? '1.0' : '0.7', lastmod: new Date().toISOString() });
  }
  for (const c of categories) {
    urls.push({ loc: `${site.url}/blog/category/${c.slug}`, priority: '0.6', lastmod: new Date().toISOString() });
  }
  for (const post of posts) {
    const lm = (post.data.updatedDate ?? post.data.pubDate);
    urls.push({ loc: `${site.url}/blog/${post.slug}`, priority: '0.8', lastmod: new Date(lm).toISOString() });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
