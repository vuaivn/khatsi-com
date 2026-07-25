import fs from 'fs';
import path from 'path';

const blogDir = 'src/content/blog';
const pubDir = 'public';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

let missing = [];
let noHero = [];
let ok = 0;
let heroVals = [];

for (const f of files) {
  const txt = fs.readFileSync(path.join(blogDir, f), 'utf8');
  const fmMatch = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = fmMatch ? fmMatch[1] : '';
  const m = fm.match(/heroImage:\s*["']?([^"'\r\n]+)["']?/);
  if (!m) { noHero.push(f); continue; }
  let hero = m[1].trim();
  heroVals.push({f, hero});
  // resolve to public path
  let rel = hero.startsWith('/') ? hero.slice(1) : hero;
  const diskPath = path.join(pubDir, decodeURIComponent(rel));
  if (fs.existsSync(diskPath)) {
    const sz = fs.statSync(diskPath).size;
    if (sz < 5000) missing.push({f, hero, reason: `tiny ${sz}b`});
    else ok++;
  } else {
    missing.push({f, hero, reason: 'not found on disk'});
  }
}

console.log(`Total posts: ${files.length}`);
console.log(`OK hero: ${ok}`);
console.log(`No heroImage field: ${noHero.length}`);
if (noHero.length) console.log('  ->', noHero.join(', '));
console.log(`Missing/broken: ${missing.length}`);
missing.forEach(x => console.log(`  [${x.reason}] ${x.f} -> ${x.hero}`));
