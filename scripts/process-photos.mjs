import sharp from 'sharp';
import exifr from 'exifr';
import { readdir, stat, writeFile, mkdir } from 'fs/promises';
import { join, parse } from 'path';

const PHOTOS_DIR = 'content/photos';
const ORIGINALS_DIR = 'content/photos/_originals';
const MAX_WIDTH = 2560;
const manifest = [];

await mkdir(ORIGINALS_DIR, { recursive: true });

const files = await readdir(PHOTOS_DIR);
for (const file of files) {
  if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
  const path = join(PHOTOS_DIR, file);
  const { size } = await stat(path);
  
  // Skip if already small
  if (size < 2_000_000) {
    const meta = await sharp(path).metadata();
    const exif = await exifr.parse(path).catch(() => null);
    manifest.push({
      file,
      width: meta.width,
      height: meta.height,
      taken: exif?.DateTimeOriginal || null,
      camera: exif?.Model || null,
    });
    continue;
  }
  
  // Resize large files
  console.log(`Resizing ${file}...`);
  const buffer = await sharp(path)
    .resize(MAX_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  await writeFile(path, buffer);
}

await writeFile(
  'content/photos/manifest.json',
  JSON.stringify(manifest, null, 2)
);
console.log(`Processed ${manifest.length} photos`);