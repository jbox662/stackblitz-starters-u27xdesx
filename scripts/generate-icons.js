const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  // Create a base SVG with your app's initial
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#111827"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            font-family="Arial" font-size="280" fill="#ffffff">
        B
      </text>
    </svg>
  `;

  // Ensure the public directory exists
  await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });

  // Generate 192x192 icon
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192.png'));

  // Generate 512x512 icon
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512.png'));

  // Generate 512x512 maskable icon (with padding)
  const maskableSvg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#111827"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
            font-family="Arial" font-size="200" fill="#ffffff">
        B
      </text>
    </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512-maskable.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 