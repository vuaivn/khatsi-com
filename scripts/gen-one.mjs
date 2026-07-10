import { statSync, readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
const envPath = new URL('../../.env-autoblog', import.meta.url);
if (existsSync(envPath)) { for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) { const m = line.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; } }
const KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image';
const prompt = process.argv[2]; const out = process.argv[3];
async function gen(p){ const url=`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`; const body={contents:[{parts:[{text:p}]}],generationConfig:{responseModalities:['IMAGE'],imageConfig:{aspectRatio:'16:9'}}}; const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!res.ok) throw new Error(`API ${res.status}`); const data=await res.json(); const part=(data?.candidates?.[0]?.content?.parts??[]).find(x=>x.inlineData?.data); return Buffer.from(part.inlineData.data,'base64'); }
const buf=await gen(prompt); await sharp(buf).resize(1200).webp({quality:82}).toFile(out);
console.log(`✓ ${out} (${(statSync(out).size/1024).toFixed(0)}KB)`);
