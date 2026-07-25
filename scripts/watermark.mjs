// Thêm watermark "khatsi.com" vào ảnh webp trong public/images/posts.
// Usage: node scripts/watermark.mjs <file1.webp> <file2.webp> ...
//        node scripts/watermark.mjs --all   (toàn bộ ảnh trong posts)
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const POSTS = "C:/Users/Administrator/aicoworker/openclaw/workspace-builtwebsite/khatsi-com/public/images/posts";
const TEXT = process.env.WM_TEXT || "khatsi.com";

let files = process.argv.slice(2);
if (files[0] === "--all") files = readdirSync(POSTS).filter(f => /\.webp$/i.test(f));
if (!files.length) { console.error("No files."); process.exit(1); }

for (const f of files) {
  const p = join(POSTS, f);
  const srcBuf = readFileSync(p);
  const img = sharp(srcBuf);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  const fs = Math.max(16, Math.round(W * 0.028));           // cỡ chữ theo bề rộng
  const padX = Math.round(W * 0.022), padY = Math.round(H * 0.045);
  // SVG watermark góc dưới-phải: chữ trắng + viền mờ để đọc trên mọi nền
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .wm { font-family: Georgia, 'Times New Roman', serif; font-size:${fs}px; font-weight:600; }
    </style>
    <text x="${W - padX}" y="${H - padY}" text-anchor="end"
          class="wm" fill="#ffffff" fill-opacity="0.82"
          stroke="#000000" stroke-opacity="0.28" stroke-width="${Math.max(1, fs*0.05)}"
          paint-order="stroke">${TEXT}</text>
  </svg>`;
  const buf = await img
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(p, buf);
  console.log("WM:", f, `${W}x${H}`);
}
