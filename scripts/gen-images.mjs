import { statSync, readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
// Nạp .env-autoblog (workspace-builtwebsite/.env-autoblog)
const envPath = new URL('../../.env-autoblog', import.meta.url);
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Thiếu GEMINI_API_KEY'); process.exit(1); }
const MODEL = 'gemini-2.5-flash-image';
// Palette Phật giáo: vàng sòng, be, nâu trầm, xanh rêu — thanh tịnh
const STYLE = 'serene minimalist flat vector illustration, Buddhist aesthetic, warm palette (saffron gold #c8912e, cream beige, warm brown, muted sage green), lotus and zen motifs, peaceful and reverent, no text, wide horizontal 16:9 composition';
const JOBS = [
  { n:'hero-phap-cu', p:`an ancient Buddhist scripture Dhammapada with a glowing lotus, sacred and calm, ${STYLE}` },
  { n:'in-phap-cu', p:`verses of wisdom radiating light like jewels, Buddhist teaching, ${STYLE}` },
  { n:'hero-tam-kinh', p:`Heart Sutra emptiness concept, a serene zen enso circle with soft light, ${STYLE}` },
  { n:'in-tam-kinh', p:`emptiness and form, a translucent lotus dissolving into light, sunyata concept, ${STYLE}` },
  { n:'hero-tu-dieu-de', p:`the Dharma wheel with eight spokes representing the Noble Eightfold Path, ${STYLE}` },
  { n:'in-tu-dieu-de', p:`four noble truths as a path from suffering to peace, dharma wheel, ${STYLE}` },
  { n:'hero-vo-thuong', p:`impermanence, a bodhi leaf falling onto flowing water, gentle change, ${STYLE}` },
  { n:'in-vo-thuong', p:`the flow of impermanence, leaves and ripples in calm water, ${STYLE}` },
  { n:'hero-chanh-niem', p:`a person meditating peacefully in lotus pose with soft breath, mindfulness, ${STYLE}` },
  { n:'in-chanh-niem', p:`mindful breathing, gentle curved lines of inhale and exhale around a calm figure, ${STYLE}` },
  { n:'hero-thieu-duc', p:`a simple alms bowl with soft light, monastic simplicity, contentment, ${STYLE}` },
  { n:'in-thieu-duc', p:`living simply with few needs, an empty bowl and a single lotus, contentment, ${STYLE}` },
];
async function gen(prompt){
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
  const body={contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9'}}};
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0,150)}`);
  const data=await res.json();
  const part=(data?.candidates?.[0]?.content?.parts??[]).find(p=>p.inlineData?.data);
  if(!part) throw new Error('no image');
  return Buffer.from(part.inlineData.data,'base64');
}
const dir='public/images/posts/';
let fail=0;
for(const j of JOBS){
  let ok=false;
  for(let a=0;a<3&&!ok;a++){
    try{ const buf=await gen(j.p); await sharp(buf).resize(1200).webp({quality:82}).toFile(dir+j.n+'.webp');
      console.log(`✓ ${j.n}.webp (${(statSync(dir+j.n+'.webp').size/1024).toFixed(0)}KB)`); ok=true;
    }catch(e){ console.log(`… retry ${j.n} (${a+1}): ${e.message}`); await new Promise(r=>setTimeout(r,3000)); }
  }
  if(!ok){ console.log(`✗ FAILED ${j.n}`); fail++; }
}
console.log(`DONE (fail=${fail})`);
