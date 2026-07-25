import sharp from 'sharp';

async function watermark(inputPath, outputPath, domain) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const resized = img.resize(1500, Math.round(1500 * meta.height / meta.width));
  const resMetadata = await resized.metadata();
  
  const svg = Buffer.from(`
    <svg width='${resMetadata.width}' height='${resMetadata.height}'>
      <text x='${resMetadata.width - 20}' y='${resMetadata.height - 15}' 
            font-size='16' fill='white' text-anchor='end' font-family='Arial'>
        ${domain}
      </text>
    </svg>
  `);
  
  await resized
    .composite([{ input: svg, gravity: 'southeast' }])
    .webp({ quality: 66 })
    .toFile(outputPath);
  console.log('✅ ' + outputPath);
}

Promise.all([
  watermark('public/images/posts/gemini-img-1784122688017.png', 'public/images/posts/tu-dieu-de-la-gi-02-dieu.webp', 'khatsi.com')
]).catch(err => console.error(err));
