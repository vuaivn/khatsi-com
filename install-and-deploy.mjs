#!/usr/bin/env node
/**
 * install-and-deploy.mjs — Bypass npm completely, build + deploy Astro
 * Usage: node install-and-deploy.mjs
 * 
 * No npm needed. Uses built-in Node APIs to:
 * 1. Check if node_modules exist (if not, user must npm install separately)
 * 2. Run Astro build
 * 3. Run Cloudflare deploy
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const ENV_FILE = path.resolve(path.dirname(ROOT), '.env-autoblog');
const PROJECT = 'khatsi-com';
const slug = 'vo-nga-anatta';

console.log('=== Astro Build + Deploy (No npm wrapper) ===\n');

// Check prerequisites
console.log('✓ Checking prerequisites...');
if (!existsSync(path.join(ROOT, 'node_modules'))) {
  console.error('❌ node_modules not found!');
  console.error('\nRun first: npm install');
  console.error('Or: npm ci');
  process.exit(1);
}
console.log('✓ node_modules exists');

if (!existsSync(ENV_FILE)) {
  console.error(`❌ .env-autoblog not found at ${ENV_FILE}`);
  process.exit(1);
}
console.log('✓ .env-autoblog exists');

// Load credentials
console.log('\n📋 Loading Cloudflare credentials...');
const env = new Map();
readFileSync(ENV_FILE, 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env.set(m[1], m[2].trim());
});

if (!env.get('CLOUDFLARE_API_TOKEN') || !env.get('CLOUDFLARE_ACCOUNT_ID')) {
  console.error('❌ Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID in .env-autoblog');
  process.exit(1);
}

process.env.CLOUDFLARE_API_TOKEN = env.get('CLOUDFLARE_API_TOKEN');
process.env.CLOUDFLARE_ACCOUNT_ID = env.get('CLOUDFLARE_ACCOUNT_ID');
console.log('✓ Credentials loaded');

// Build Astro
console.log('\n📦 Building Astro...');
try {
  const astroCmd = path.join(ROOT, 'node_modules', '.bin', 'astro');
  execSync(`"${astroCmd}" build`, {
    stdio: 'inherit',
    cwd: ROOT,
    env: process.env,
    shell: process.platform === 'win32' ? 'powershell' : '/bin/bash'
  });
  console.log('✓ Build complete');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}

// Deploy
console.log('\n🚀 Deploying to Cloudflare Pages...');
try {
  const wranglerCmd = path.join(ROOT, 'node_modules', '.bin', 'wrangler');
  execSync(
    `"${wranglerCmd}" pages deploy dist --project-name=${PROJECT} --branch=main --commit-dirty=true`,
    {
      stdio: 'inherit',
      cwd: ROOT,
      env: process.env,
      shell: process.platform === 'win32' ? 'powershell' : '/bin/bash'
    }
  );
  console.log('✓ Deploy complete');
} catch (e) {
  console.error('❌ Deploy failed:', e.message);
  process.exit(1);
}

// Verify
console.log('\n⏳ Verifying deployment (waiting 12s)...');
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
    console.log(`   status=${res.status} | title="${title}"`);
  } catch (e) {
    console.log(`❌ ${url} → ${e.message}`);
  }
}

console.log('\n=== Success! Blog post deployed ===');
