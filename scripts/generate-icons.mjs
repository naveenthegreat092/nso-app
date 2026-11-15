import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = 'c:/NSO(NEW SHOPPIMG ORBIT)';
const iconSvgPath = path.join(ROOT, 'public/nso-app-icon.svg');
const iconBuffer = fs.readFileSync(iconSvgPath);

const densities = [
  { name: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { name: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { name: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { name: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { name: 'mipmap-xxxhdpi', size: 192, fgSize: 432 }
];

async function generateAll() {
  console.log('Generating Android icons with sharp...');

  for (const d of densities) {
    const dir = path.join(ROOT, 'android/app/src/main/res', d.name);

    // 1. Standard ic_launcher.png
    await sharp(iconBuffer)
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // 2. Round ic_launcher_round.png
    const circleMask = Buffer.from(
      `<svg width="${d.size}" height="${d.size}"><circle cx="${d.size/2}" cy="${d.size/2}" r="${d.size/2}" fill="#fff"/></svg>`
    );
    await sharp(iconBuffer)
      .resize(d.size, d.size)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // 3. Adaptive ic_launcher_foreground.png (centered with safe zone margin)
    const contentSize = Math.round(d.fgSize * 0.72);
    const offset = Math.round((d.fgSize - contentSize) / 2);
    const resizedContent = await sharp(iconBuffer)
      .resize(contentSize, contentSize)
      .toBuffer();

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedContent, top: offset, left: offset }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${d.name} generated (${d.size}x${d.size}, fg: ${d.fgSize}x${d.fgSize})`);
  }

  // 4. Web PWA icons
  await sharp(iconBuffer).resize(192, 192).png().toFile(path.join(ROOT, 'public/icon-192.png'));
  await sharp(iconBuffer).resize(512, 512).png().toFile(path.join(ROOT, 'public/icon-512.png'));
  console.log('✓ Web PWA icons generated');

  // 5. Update ic_launcher_background.xml to match brand dark blue
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#111b68</color>
</resources>
`;
  fs.writeFileSync(path.join(ROOT, 'android/app/src/main/res/values/ic_launcher_background.xml'), bgXml, 'utf8');
  console.log('✓ ic_launcher_background.xml updated to #111b68');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
