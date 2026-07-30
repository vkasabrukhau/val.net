# Val Kasabrukhau Portfolio

A Next.js portfolio built with React and the App Router.

## Adding content

Content lives in JSON files under `data/` — edit them (locally or straight
from the GitHub web UI) and Vercel redeploys automatically.

- **Shoes** (`data/shoes.json`): add an object with `brand`, `brandKey`
  (`nike` | `adidas` | `yeezy` | `acg`), `tag` (unique per brand), `category`
  (`Running` | `Hiking` | `Casual` | `Fashion`), `name`, `blurb`, and `meta`.
- **Photos** (`data/photos.json`): upload the image to `public/uploads/`
  (resize to ~1600px wide first), then add an entry with `src`
  (`/uploads/<filename>`), `label`, `source` (`iPhone` | `Fujifilm X-M5` |
  `Digital Art` | `Drawings`), `date` (`YYYY-MM-DD`), `width`/`height`
  (pixel dimensions — run `sips -g pixelWidth -g pixelHeight <file>` to get
  them; used for the resolution sort and frame aspect ratio), and an
  optional `rotation` (degrees).

## Development

```bash
npm run dev
```

## Production check

```bash
npm run lint
npm run build
```

## Deploy to Vercel

Import the repository into Vercel and leave the framework preset set to
**Next.js**. Vercel will use `npm run build`; no environment variables or
custom Vercel configuration are required.

The project supports Node.js 20.9 or newer. Its display-font stack is local,
so the production build does not rely on a Google Fonts network request.
