import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'apps', 'web', 'public');

// Classic cloud icon SVG — Material Design style, matches Logo.tsx
const cloudMSvg = `
<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
    stroke="#38bdf8"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>
`;

// Gradient background for maskable
const backgroundSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="112" />
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  const logoBuffer = Buffer.from(cloudMSvg);
  const bgBuffer = Buffer.from(backgroundSvg);

  // Generate transparent "any" icons (192 and 512)
  console.log('Generating transparent icons...');
  await sharp(logoBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192x192.png'));

  await sharp(logoBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512x512.png'));

  // Generate solid "maskable" icons (192 and 512) with background padding
  console.log('Generating maskable icons...');
  
  console.log('Generating maskable icons...');
  
  // 512 maskable
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 15, g: 23, b: 42, alpha: 1 } }
  }).composite([{ input: await sharp(logoBuffer).resize(384, 384).toBuffer() }])
  .png()
  .toFile(path.join(PUBLIC_DIR, 'icon-maskable-512x512.png'));

  // 192 maskable
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 15, g: 23, b: 42, alpha: 1 } }
  }).composite([{ input: await sharp(logoBuffer).resize(144, 144).toBuffer() }])
  .png()
  .toFile(path.join(PUBLIC_DIR, 'icon-maskable-192x192.png'));

  console.log('Done!');
}

generateIcons().catch(console.error);
