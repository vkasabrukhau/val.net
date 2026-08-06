// Photo pipeline: Obsidian vault (content/photos) -> site.
//
// Drop JPG/PNG/WebP files in content/photos/ (or a subfolder whose name
// becomes the filter label, e.g. "Drawings/"). For each image this script:
//   1. reads EXIF (capture date + camera model) straight from the file,
//   2. preserves the untouched original in content/photos/_originals/
//      before downsizing any oversized vault copy in place (keeps git lean),
//   3. emits a web-sized WebP into public/photos/,
//   4. rebuilds data/photos.json in the shape PhotoGrid expects.
// Runs via `npm run photos:process` and automatically on every build.
import sharp from 'sharp';
import { readdir, stat, copyFile, writeFile, mkdir, access, unlink } from 'fs/promises';
import { join, parse } from 'path';

const VAULT = 'content/photos';
const ORIGINALS = join(VAULT, '_originals');
const OUT = 'public/photos';
const MANIFEST = 'data/photos.json';
const VAULT_MAX_WIDTH = 2560; // master kept in the vault / git
const WEB_MAX_WIDTH = 1600;   // what actually ships
const IMAGE = /\.(jpe?g|png|webp)$/i;

// Minimal EXIF (TIFF IFD) reader: camera model + capture date only.
function parseExif(buffer) {
  try {
    if (!buffer || buffer.length < 14) return {};
    const base = buffer.toString('ascii', 0, 4) === 'Exif' ? 6 : 0;
    const order = buffer.toString('ascii', base, base + 2);
    if (order !== 'II' && order !== 'MM') return {};
    const u16 = p => (order === 'II' ? buffer.readUInt16LE(p) : buffer.readUInt16BE(p));
    const u32 = p => (order === 'II' ? buffer.readUInt32LE(p) : buffer.readUInt32BE(p));
    const asciiValue = entry => {
      const count = u32(entry + 4);
      const at = count <= 4 ? entry + 8 : base + u32(entry + 8);
      if (at + count > buffer.length) return undefined;
      return buffer.toString('ascii', at, at + count).replace(/\0+$/, '').trim();
    };
    const scan = offset => {
      const found = {};
      if (offset + 2 > buffer.length) return found;
      const entries = u16(offset);
      for (let i = 0; i < entries; i++) {
        const entry = offset + 2 + i * 12;
        if (entry + 12 > buffer.length) break;
        const tag = u16(entry);
        if (tag === 0x0110) found.model = asciiValue(entry);          // Model
        if (tag === 0x9003) found.taken = asciiValue(entry);          // DateTimeOriginal
        if (tag === 0x8769) found.exifIfd = u32(entry + 8);           // Exif IFD pointer
      }
      return found;
    };
    const ifd0 = scan(base + u32(base + 4));
    const exifIfd = ifd0.exifIfd ? scan(base + ifd0.exifIfd) : {};
    return { model: ifd0.model, taken: exifIfd.taken || ifd0.taken };
  } catch {
    return {};
  }
}

const sourceFromModel = model => {
  if (!model) return 'Unsorted';
  if (/iphone/i.test(model)) return 'iPhone';
  if (/x-m5/i.test(model)) return 'Fujifilm X-M5';
  return model;
};

// EXIF "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DD"
const dateFromExif = taken => {
  const m = /^(\d{4}):(\d{2}):(\d{2})/.exec(taken || '');
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

const slugify = name => parse(name).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'photo';

// Deterministic "hand-placed" tilt: magnitude (1.2-2.6 degrees) hashed from the
// slug with full avalanche mixing — similar filenames like photo-01/photo-02
// must not land on similar angles. Direction alternates down the date-sorted
// manifest so frames never all lean the same way.
const magnitudeFor = slug => {
  let h = 2166136261;
  for (const c of slug) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; h >>>= 0;
  return 1.2 + ((h % 1000) / 999) * 1.4;
};

const exists = path => access(path).then(() => true, () => false);

await mkdir(ORIGINALS, { recursive: true });
await mkdir(OUT, { recursive: true });

// Collect vault images: root files (source from EXIF) and one level of
// subfolders whose name is used verbatim as the source label.
const jobs = [];
for (const entry of await readdir(VAULT, { withFileTypes: true })) {
  if (entry.isFile() && IMAGE.test(entry.name)) {
    jobs.push({ path: join(VAULT, entry.name), name: entry.name, source: null });
  } else if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
    for (const file of await readdir(join(VAULT, entry.name))) {
      if (IMAGE.test(file)) jobs.push({ path: join(VAULT, entry.name, file), name: file, source: entry.name });
    }
  }
}

const manifest = [];
const slugs = new Set();
for (const job of jobs) {
  const meta = await sharp(job.path).metadata();
  const exif = parseExif(meta.exif);
  const stats = await stat(job.path);

  let slug = slugify(job.name);
  for (let n = 2; slugs.has(slug); n++) slug = `${slugify(job.name)}-${n}`;
  slugs.add(slug);

  // Keep the untouched original, then cap the vault copy so git stays lean.
  if ((meta.width ?? 0) > VAULT_MAX_WIDTH) {
    const keep = join(ORIGINALS, job.name);
    if (!(await exists(keep))) await copyFile(job.path, keep);
    console.log(`Downsizing vault copy of ${job.name} (${meta.width}px wide)...`);
    const format = /\.png$/i.test(job.name) ? { id: 'png' } : { id: 'jpeg', options: { quality: 85, mozjpeg: true } };
    const resized = await sharp(job.path)
      .rotate()
      .resize(VAULT_MAX_WIDTH, null, { withoutEnlargement: true })
      .toFormat(format.id, format.options)
      .toBuffer();
    await writeFile(job.path, resized);
  }

  const { data, info } = await sharp(job.path)
    .rotate()
    .resize(WEB_MAX_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(join(OUT, `${slug}.webp`), data);

  manifest.push({
    src: `/photos/${slug}.webp`,
    slug,
    source: job.source || sourceFromModel(exif.model),
    date: dateFromExif(exif.taken) || stats.mtime.toISOString().slice(0, 10),
    width: info.width,
    height: info.height,
  });
}

// Newest first; labels follow that order.
manifest.sort((a, b) => (a.date < b.date ? 1 : -1));
const photos = manifest.map(({ slug, ...photo }, i) => ({
  label: `no.${String(i + 1).padStart(2, '0')}`,
  ...photo,
  rotation: Number(((i % 2 ? 1 : -1) * magnitudeFor(slug)).toFixed(1)),
}));
await writeFile(MANIFEST, `${JSON.stringify(photos, null, 2)}\n`);

// Drop processed files whose vault photo is gone.
for (const file of await readdir(OUT)) {
  if (file.endsWith('.webp') && !slugs.has(file.replace(/\.webp$/, ''))) {
    await unlink(join(OUT, file));
    console.log(`Pruned orphan ${file}`);
  }
}

console.log(`Processed ${photos.length} photos -> ${OUT} + ${MANIFEST}`);
