import sharp from 'sharp';

async function watermark(inputPath, outputPath, domain = 'khatsi.com') {
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

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node _watermark_generic.mjs <input.png> <output.webp>');
  process.exit(1);
}

watermark(input, output).catch(err => { console.error(err); process.exit(1); });
