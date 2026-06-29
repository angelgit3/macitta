import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'apps', 'web', 'public');

// Macitta mark: an open study book with an "M" memory path.
const macittaMarkSvg = `
<svg width="512" height="512" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13 18.8C20.1 14.9 26.4 15.6 32 20.9C37.6 15.6 43.9 14.9 51 18.8V47.5C43.9 43.6 37.6 44.3 32 49.6C26.4 44.3 20.1 43.6 13 47.5V18.8Z" fill="#7C85E8" opacity="0.18" />
  <path d="M13 18.8C20.1 14.9 26.4 15.6 32 20.9C37.6 15.6 43.9 14.9 51 18.8V47.5C43.9 43.6 37.6 44.3 32 49.6C26.4 44.3 20.1 43.6 13 47.5V18.8Z" stroke="#7C85E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M22 38V26L32 35.5L42 26V38" stroke="#F0F1FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="15" r="3" fill="#E8B84B" />
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  const logoBuffer = Buffer.from(macittaMarkSvg);

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

  // 512 maskable
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 13, g: 14, b: 23, alpha: 1 } }
  }).composite([{ input: await sharp(logoBuffer).resize(384, 384).toBuffer() }])
  .png()
  .toFile(path.join(PUBLIC_DIR, 'icon-maskable-512x512.png'));

  // 192 maskable
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 13, g: 14, b: 23, alpha: 1 } }
  }).composite([{ input: await sharp(logoBuffer).resize(144, 144).toBuffer() }])
  .png()
  .toFile(path.join(PUBLIC_DIR, 'icon-maskable-192x192.png'));

  // favicon.ico (32x32 with white fill + blue stroke for dark backgrounds)
  console.log('Generating favicon.ico...');
  const faviconSvg = `
<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="56" height="56" rx="14" fill="#0D0E17" />
  <path d="M13 18.8C20.1 14.9 26.4 15.6 32 20.9C37.6 15.6 43.9 14.9 51 18.8V47.5C43.9 43.6 37.6 44.3 32 49.6C26.4 44.3 20.1 43.6 13 47.5V18.8Z" stroke="#7C85E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M22 38V26L32 35.5L42 26V38" stroke="#F0F1FF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="15" r="3" fill="#E8B84B" />
</svg>`;
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

  // apple-touch-icon.png (180x180, solid background for iOS home screen)
  console.log('Generating apple-touch-icon.png...');
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 13, g: 14, b: 23, alpha: 1 } }
  }).composite([{ input: await sharp(logoBuffer).resize(135, 135).toBuffer() }])
  .png()
  .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

  console.log('Done!');
}

generateIcons().catch(console.error);
