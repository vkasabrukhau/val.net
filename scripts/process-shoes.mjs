#!/usr/bin/env node
/**
 * Shoe photo pipeline — turns raw photos into box-ready cutouts.
 *
 * Drop photos into shoe-photos/, named after the shoe's `tag` in
 * data/shoes.json (e.g. daily.heic, running.jpg, grail.png). Then:
 *
 *     npm run shoes
 *
 * Stages, per photo:
 *   1. Ingestion        — HEIC/HEIF transcoded via macOS `sips`; EXIF rotation
 *                         applied; converted to sRGB; capped to 1600px.
 *   2. Segmentation     — @imgly/background-removal-node (ONNX, runs locally,
 *                         model bundled with the package) isolates the shoe
 *                         onto a transparent background.
 *   3. Crop             — alpha-aware trim to the shoe's tight bounding box.
 *   4. Scale            — fit within 80% of the canvas width and height.
 *   5. Position         — centered horizontally, soles resting on a floor
 *                         line 8% up from the bottom edge.
 *   6. Composite        — soft contact shadow + transparent background,
 *                         written as WebP to public/shoes/<tag>.webp.
 *
 * The canvas is 960x435 — exactly 3x the 320x145 box back face in
 * ShoeCloset, so the site can display it 1:1 with object-fit: contain.
 *
 * Outputs are only rebuilt when the source photo is newer (process once);
 * data/shoe-images.json is regenerated as the tag -> image manifest that
 * ShoeCloset.jsx imports.
 *
 * Flags:
 *   --force        reprocess everything, even if up to date
 *   --no-shadow    skip the baked contact shadow
 *   --input <dir>  read photos from another folder (default shoe-photos/)
 *   --only a,b     only process these tags
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "public", "shoes");
const MANIFEST = path.join(ROOT, "data", "shoe-images.json");
const SHOES_JSON = path.join(ROOT, "data", "shoes.json");

// Box back face is 320x145 CSS px; render at 3x for retina.
const CANVAS_W = 960;
const CANVAS_H = 435;
const MAX_W_FRAC = 0.8; // shoe width cap, fraction of canvas width
const MAX_H_FRAC = 0.8; // shoe height cap, fraction of canvas height
const FLOOR_FRAC = 0.08; // empty floor strip below the sole
const MAX_SIDE = 1600; // cap input resolution before segmentation
const ALPHA_TRIM_THRESHOLD = 12; // ignore faint halo pixels when cropping

const INPUT_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff", ".heic", ".heif",
]);

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const SHADOW = !args.includes("--no-shadow");
const inputFlag = args.indexOf("--input");
const INPUT_DIR = inputFlag !== -1 && args[inputFlag + 1]
  ? path.resolve(args[inputFlag + 1])
  : path.join(ROOT, "shoe-photos");
const onlyFlag = args.indexOf("--only");
const ONLY = onlyFlag !== -1 && args[onlyFlag + 1]
  ? new Set(args[onlyFlag + 1].split(",").map(t => t.trim()))
  : null;

/* -------------------------------------------------------------------------
 * Stage 1 — ingestion
 * ------------------------------------------------------------------------- */

function transcodeHeic(file, tmpDir) {
  if (process.platform !== "darwin") {
    throw new Error("HEIC input needs macOS `sips`; convert to JPEG/PNG first");
  }
  const out = path.join(tmpDir, `${path.parse(file).name}.png`);
  execFileSync("sips", ["-s", "format", "png", file, "--out", out], { stdio: "pipe" });
  return out;
}

async function ingest(file, tmpDir) {
  const ext = path.extname(file).toLowerCase();
  const source = ext === ".heic" || ext === ".heif" ? transcodeHeic(file, tmpDir) : file;
  // rotate() with no args applies the EXIF orientation; sharp's pipeline
  // colourspace conversion honours any embedded ICC profile on decode.
  return sharp(source)
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .png()
    .toBuffer();
}

/* -------------------------------------------------------------------------
 * Stage 2 — segmentation (the swappable step: rembg/SAM/remove.bg would
 * slot in here; contract is photo buffer in, RGBA cutout buffer out)
 * ------------------------------------------------------------------------- */

let removeBackground;

async function segment(buffer) {
  if (!removeBackground) {
    ({ removeBackground } = await import("@imgly/background-removal-node"));
  }
  const blob = await removeBackground(new Blob([buffer], { type: "image/png" }), {
    output: { format: "image/png" },
  });
  return Buffer.from(await blob.arrayBuffer());
}

/* -------------------------------------------------------------------------
 * Stages 3-6 — crop, scale, position, composite
 * ------------------------------------------------------------------------- */

async function cropToAlpha(cutout) {
  const { data, info } = await sharp(cutout)
    .trim({
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      threshold: ALPHA_TRIM_THRESHOLD,
    })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

function contactShadowSvg(shoeWidth) {
  const cy = Math.round(CANVAS_H * (1 - FLOOR_FRAC));
  const rx = Math.round(shoeWidth * 0.47);
  const ry = Math.round(CANVAS_H * 0.024);
  const blur = Math.round(CANVAS_H * 0.016);
  return Buffer.from(
    `<svg width="${CANVAS_W}" height="${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><filter id="b" x="-60%" y="-60%" width="220%" height="220%">` +
      `<feGaussianBlur stdDeviation="${blur}"/></filter></defs>` +
      `<ellipse cx="${CANVAS_W / 2}" cy="${cy}" rx="${rx}" ry="${ry}"` +
      ` fill="rgb(14,20,20)" fill-opacity="0.32" filter="url(#b)"/>` +
      `</svg>`
  );
}

async function compose(cropped, outFile) {
  const scale = Math.min(
    (CANVAS_W * MAX_W_FRAC) / cropped.width,
    (CANVAS_H * MAX_H_FRAC) / cropped.height
  );
  const w = Math.max(1, Math.round(cropped.width * scale));
  const h = Math.max(1, Math.round(cropped.height * scale));
  const shoe = await sharp(cropped.buffer)
    .resize(w, h, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const baseline = Math.round(CANVAS_H * (1 - FLOOR_FRAC));
  const layers = [];
  if (SHADOW) layers.push({ input: contactShadowSvg(w), left: 0, top: 0 });
  layers.push({
    input: shoe,
    left: Math.round((CANVAS_W - w) / 2),
    top: baseline - h,
  });

  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(layers)
    .webp({ quality: 88, effort: 5 })
    .toFile(outFile);
}

/* -------------------------------------------------------------------------
 * Driver
 * ------------------------------------------------------------------------- */

function knownTags() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SHOES_JSON, "utf8")).map(s => s.tag));
  } catch {
    return new Set();
  }
}

function isFresh(inFile, outFile) {
  try {
    return fs.statSync(outFile).mtimeMs >= fs.statSync(inFile).mtimeMs;
  } catch {
    return false;
  }
}

if (!fs.existsSync(INPUT_DIR)) {
  console.error(`Input folder not found: ${INPUT_DIR}`);
  console.error("Create it and drop shoe photos in, named <tag>.<ext> (see data/shoes.json for tags).");
  process.exit(1);
}

const inputs = fs
  .readdirSync(INPUT_DIR)
  .filter(f => !f.startsWith(".") && INPUT_EXTS.has(path.extname(f).toLowerCase()))
  .map(f => path.join(INPUT_DIR, f))
  .sort();

if (inputs.length === 0) {
  console.log(`No photos found in ${path.relative(ROOT, INPUT_DIR)}/ — nothing to do.`);
  process.exit(0);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "shoe-pipeline-"));
const tags = knownTags();
const manifest = fs.existsSync(MANIFEST)
  ? JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
  : {};

let processed = 0;
let skipped = 0;
let failed = 0;

for (const file of inputs) {
  const slug = path.parse(file).name.trim().toLowerCase().replace(/\s+/g, "-");
  if (ONLY && !ONLY.has(slug)) continue;
  const outFile = path.join(OUTPUT_DIR, `${slug}.webp`);
  const publicPath = `/shoes/${slug}.webp`;
  const label = path.basename(file);

  if (!tags.has(slug)) {
    console.warn(`! ${label}: no shoe with tag "${slug}" in data/shoes.json — processing anyway, but the site will not show it until the tag exists`);
  }

  if (!FORCE && isFresh(file, outFile)) {
    manifest[slug] = publicPath;
    skipped++;
    continue;
  }

  try {
    const photo = await ingest(file, tmpDir);
    const cutout = await segment(photo);
    const cropped = await cropToAlpha(cutout);
    if (cropped.width < 8 || cropped.height < 8) {
      throw new Error("segmentation left almost nothing — is the shoe visible against the background?");
    }
    await compose(cropped, outFile);
    manifest[slug] = publicPath;
    processed++;
    const kb = Math.round(fs.statSync(outFile).size / 1024);
    console.log(`✓ ${label} -> public/shoes/${slug}.webp (${kb} KB)`);
  } catch (err) {
    failed++;
    console.error(`✗ ${label}: ${err.message}`);
  }
}

// Drop manifest entries whose output file no longer exists.
for (const slug of Object.keys(manifest)) {
  if (!fs.existsSync(path.join(OUTPUT_DIR, `${slug}.webp`))) delete manifest[slug];
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\nDone: ${processed} processed, ${skipped} up to date, ${failed} failed.`);
console.log(`Manifest: ${path.relative(ROOT, MANIFEST)} (${Object.keys(sorted).length} shoes)`);
process.exit(failed > 0 ? 1 : 0);
