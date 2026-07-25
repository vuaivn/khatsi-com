#!/usr/bin/env node
/**
 * khatsi.com — Standardized deploy (bypasses broken GitHub→Cloudflare webhook)
 * Usage: node deploy.mjs [slug-to-verify]
 * Steps: load CF creds → build → wrangler pages deploy → verify HTTP 200 + title
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const ENV_FILE = path.resolve('..', '.env-autoblog');
const PROJECT = 'khatsi-com';
const slug = process.argv[2] || '';

function loadEnv() {
  const txt = readFileSync(ENV_FILE, 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID)
    throw new Error('Missing CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID in .env-autoblog');
}

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

async function verify(slug) {
  if (!slug) return;
  const urls = [
    `https://khatsi-com.pages.dev/blog/${slug}/`,
    `https://khatsi.com/blog/${slug}/`,
  ];
  // give propagation a moment
  await new Promise(r => setTimeout(r, 12000));
  for (const url of urls) {
    try {
      const res = await fetch(`${url}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
      const html = await res.text();
      const title = (html.match(/<title>(.*?)<\/title>/) || [,'NONE'])[1];
      const ok = res.status === 200 && !/Thi.u d.c tri t.c/.test(title) && title !== 'NONE';
      console.log(`${ok ? '✅' : '⚠️'} ${url}\n   status=${res.status} title="${title}"`);
    } catch (e) {
      console.log(`❌ ${url} → ${e.message}`);
    }
  }
}

async function logToSheet(slug) {
  if (!slug) return;
  try {
    execSync(
      `node ../.webhooks/post-to-sheet.mjs khatsi.com ${slug} src/content/blog/${slug}.md`,
      { stdio: 'inherit', cwd: ROOT }
    );
  } catch (e) {
    console.log('⚠️ Sheet logging skipped:', e.message);
  }
}

(async () => {
  console.log('=== khatsi.com deploy ===');
  loadEnv();
  // Regenerate card thumbnails (idempotent; skips existing) so new posts always have a thumb
  try { run('node ../gen-thumbs.mjs'); } catch (e) { console.log('⚠️ gen-thumbs skipped:', e.message); }
  run('npm run build');
  run(`npx wrangler pages deploy dist --project-name=${PROJECT} --branch=main --commit-dirty=true`);
  await verify(slug);
  await logToSheet(slug);
  console.log('\n=== deploy done ===');
})().catch(e => { console.error('DEPLOY FAILED:', e.message); process.exit(1); });
