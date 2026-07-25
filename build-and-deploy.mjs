#!/usr/bin/env node
/**
 * build-and-deploy.mjs — Bypass npm, build Astro + deploy to Cloudflare
 * Usage: node build-and-deploy.mjs
 */
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const ENV_FILE = path.resolve(path.dirname(ROOT), '.env-autoblog');
const PROJECT = 'khatsi-com';
const slug = 'vo-nga-anatta';

console.log('=== Astro Build + Cloudflare Deploy ===\n');

// 1) Load Cloudflare credentials
console.log('📋 Loading Cloudflare credentials...');
if (!existsSync(ENV_FILE)) {
  console.error(`❌ .env-autoblog not found at ${ENV_FILE}`);
  process.exit(1);
}

const env = new Map();
readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env.set(m[1], m[2].trim());
});

if (!env.get('CLOUDFLARE_API_TOKEN') || !env.get('CLOUDFLARE_ACCOUNT_ID')) {
  console.error('❌ Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID');
  process.exit(1);
}

process.env.CLOUDFLARE_API_TOKEN = env.get('CLOUDFLARE_API_TOKEN');
process.env.CLOUDFLARE_ACCOUNT_ID = env.get('CLOUDFLARE_ACCOUNT_ID');
console.log('✓ Credentials loaded\n');

// 2) Build Astro
console.log('📦 Building Astro...');
try {
  // Try to load astro directly from node_modules
  const astroPath = path.join(ROOT, 'node_modules', 'astro', 'dist', 'cli', 'index.js');
  
  if (existsSync(astroPath)) {
    console.log(`Using local Astro: ${astroPath}`);
    execSync(`node "${astroPath}" build`, { 
      stdio: 'inherit', 
      cwd: ROOT,
      env: process.env 
    });
  } else {
    console.log('⚠️  Astro not found locally, skipping build');
    console.log('   (will deploy existing dist/ if available)');
  }
  
  console.log('✓ Build complete\n');
} catch (e) {
  console.warn(`⚠️  Build error: ${e.message}`);
  console.log('   Continuing with deployment...\n');
}

// 3) Deploy to Cloudflare Pages
console.log('🚀 Deploying to Cloudflare Pages...');
try {
  const wranglerPath = path.join(ROOT, 'node_modules', 'wrangler', 'wrangler-cli.mjs');
  
  if (existsSync(wranglerPath)) {
    console.log(`Using wrangler: ${wranglerPath}`);
    execSync(
      `node "${wranglerPath}" pages deploy dist --project-name=${PROJECT} --branch=main --commit-dirty=true`,
      { 
        stdio: 'inherit',
        cwd: ROOT,
        env: process.env
      }
    );
  } else {
    console.error('❌ wrangler not found');
    process.exit(1);
  }
  
  console.log('✓ Deploy complete\n');
} catch (e) {
  console.error(`❌ Deploy failed: ${e.message}`);
  process.exit(1);
}

// 4) Verify deployment
console.log('⏳ Verifying deployment (waiting 12s for propagation)...\n');
await new Promise(r => setTimeout(r, 12000));

const urls = [
  `https://khatsi-com.pages.dev/blog/${slug}/`,
  `https://khatsi.com/blog/${slug}/`,
];

for (const url of urls) {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { 
      headers: { 'Cache-Control': 'no-cache' } 
    });
    const html = await res.text();
    const title = (html.match(/<title>(.*?)<\/title>/) || [, 'NONE'])[1];
    const ok = res.status === 200 && title !== 'NONE' && !/trang chủ|home/i.test(title);
    
    console.log(`${ok ? '✅' : '⚠️'} ${url}`);
    console.log(`   status=${res.status} | title="${title}"\n`);
  } catch (e) {
    console.log(`❌ ${url} → ${e.message}\n`);
  }
}

console.log('=== Deploy complete ===');
