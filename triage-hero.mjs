import fs from 'fs';
import path from 'path';

const blogDir = 'src/content/blog';
const imgDir = 'public/images/posts';
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
const diskImgs = fs.readdirSync(imgDir);

function norm(s){
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/đ/g,'d').replace(/Đ/g,'D')
    .toLowerCase().replace(/[^a-z0-9]/g,'');
}
const diskNorm = new Map(); // normbase -> filename
for (const d of diskImgs){
  diskNorm.set(norm(d.replace(/\.(webp|png|jpg|svg)$/i,'')), d);
}

let trueMissing = [], fuzzyFix = [], noHero = [];
for (const f of files){
  const txt = fs.readFileSync(path.join(blogDir,f),'utf8');
  const fm = (txt.match(/^---\r?\n([\s\S]*?)\r?\n---/)||[])[1]||'';
  const m = fm.match(/heroImage:\s*["']?([^"'\r\n]+)["']?/);
  if(!m){ noHero.push(f); continue; }
  let hero = m[1].trim();
  let rel = hero.startsWith('/')?hero.slice(1):hero;
  const diskPath = path.join('public', decodeURIComponent(rel));
  if(fs.existsSync(diskPath) && fs.statSync(diskPath).size>5000) continue; // ok
  // broken -> try fuzzy match on the referenced basename
  const base = path.basename(decodeURIComponent(rel)).replace(/\.(webp|png|jpg|svg)$/i,'');
  const nb = norm(base.replace(/^hero-/,''));
  // try match with hero- prefix normalized
  let hit = diskNorm.get(norm(base)) || diskNorm.get('hero'+nb) || diskNorm.get(nb);
  if(hit){ fuzzyFix.push({f, hero, hit}); }
  else trueMissing.push({f, hero});
}
console.log('=== FUZZY-FIXABLE (image exists under close name) ===', fuzzyFix.length);
fuzzyFix.forEach(x=>console.log(`  ${x.f}: ${path.basename(x.hero)} -> ${x.hit}`));
console.log('\n=== NO HERO FIELD ===', noHero.length);
console.log('  '+noHero.join(', '));
console.log('\n=== TRULY MISSING (need generation) ===', trueMissing.length);
trueMissing.forEach(x=>console.log(`  ${x.f} -> ${path.basename(x.hero)}`));
