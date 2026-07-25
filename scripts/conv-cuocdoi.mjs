import sharp from "sharp";
import { join } from "node:path";
const SRC = "C:/Users/Administrator/aicoworker/openclaw/workspace-main-agents/research/images/khatsi";
const OUT = "C:/Users/Administrator/aicoworker/openclaw/workspace-builtwebsite/khatsi-com/public/images/posts";
const map = [
  ["gemini-img-1783698218394.png", "hero-cuoc-doi-duc-phat.webp"],
  ["gemini-img-1783698365014.png", "cuoc-doi-duc-phat-01-bat-tuong.webp"],
  ["gemini-img-1783698529190.png", "cuoc-doi-duc-phat-02-trung-dao.webp"],
];
for (const [s, d] of map) {
  const info = await sharp(join(SRC, s)).webp({ quality: 82 }).toFile(join(OUT, d));
  console.log(d, `${info.width}x${info.height}`, Math.round(info.size/1024)+"KB");
}
