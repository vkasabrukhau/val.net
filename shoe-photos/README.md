# Shoe photo drop folder

Put raw shoe photos here, then run:

```sh
npm run shoes
```

**Naming:** each file must be named after the shoe's `tag` in
`data/shoes.json` — e.g. `daily.heic`, `running.jpg`, `grail.png`.
JPEG, PNG, WebP, AVIF, TIFF, and HEIC (macOS) all work; any resolution
or aspect ratio is fine.

The pipeline segments the shoe from its background, crops, scales, and
bottom-anchors it on a 960×435 transparent canvas with a soft contact
shadow, then writes `public/shoes/<tag>.webp` and updates the
`data/shoe-images.json` manifest that the site reads. Photos are only
reprocessed when they change (`--force` overrides; `--only tag1,tag2`
limits a run; `--no-shadow` skips the shadow).

Originals in this folder are gitignored — only the processed WebPs in
`public/shoes/` are committed.
