const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

// Images to optimize (over 500KB)
const imagesToOptimize = [
  'hero-rae-background.png',
  'calculator-background.png',
  'leader-superintendent.png',
  'hero-rae-cutout.png',
  'hero-contact.png',
  'hero-join.png',
  'hero-for-schools.png',
  'leader-principal.png',
  'leader-hr.png',
  'hero-faq.png',
  'leader-curriculum.png',
  'about-teacher-pointing.png',
  'hero-about.png',
  'course-guide.png',
  'card-blog.png',
  'hero-pd-plan.png',
  'card-resources.png',
  'hero-funding.png',
  'card-podcast.png',
  'rae-headshot.png',
];

async function optimizeImage(filename) {
  const inputPath = path.join(imagesDir, filename);
  const baseName = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  const outputPath = path.join(imagesDir, `${baseName}.webp`);

  if (!fs.existsSync(inputPath)) {
    console.log(`Skipping ${filename} - file not found`);
    return;
  }

  try {
    const metadata = await sharp(inputPath).metadata();
    const isHeroOrBackground = filename.includes('hero') || filename.includes('background');

    // Max width: 1920 for hero/backgrounds, 1200 for others
    const maxWidth = isHeroOrBackground ? 1920 : 1200;
    const targetWidth = Math.min(metadata.width, maxWidth);

    await sharp(inputPath)
      .resize(targetWidth, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✓ ${filename} -> ${baseName}.webp`);
    console.log(`  ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
  } catch (err) {
    console.error(`✗ Error optimizing ${filename}:`, err.message);
  }
}

async function main() {
  console.log('Optimizing images...\n');

  for (const image of imagesToOptimize) {
    await optimizeImage(image);
    console.log('');
  }

  console.log('Done!');
}

main();
