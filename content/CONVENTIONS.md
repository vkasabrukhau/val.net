# Writing post (content/writing/*.md)
Filename becomes the URL slug (whale.md -> /writing/whale). Read time is computed.
---
title: Post title
date: 2026-02-14
tags: [hardware, diy]
type: rambling   # or "thought" (quick spark — peach card); default rambling
draft: false     # true hides it from the site
excerpt: One-line summary for the index page
---
Markdown subset: paragraphs, # headings, > quotes, - and 1. lists,
**bold**, *italic*, `code`, ``` fences, [links](url), ![images](/path), --- rules.

# Photo (content/photos/)
Drop JPG/PNG/WebP straight in content/photos/ — capture date + camera come from
EXIF (iPhone -> "iPhone", X-M5 -> "Fujifilm X-M5"). No EXIF (scans, exports)?
Put the file in a subfolder instead; the folder name is used verbatim as the
filter label: content/photos/Drawings/, content/photos/Digital Art/, ...
iPhone shots must be exported as JPG (HEIC is ignored and gitignored).
`npm run photos:process` (also runs on every build) preserves untouched
originals in _originals/, downsizes oversized vault copies, and publishes
web WebPs to public/photos/ + data/photos.json.

# Recipe (content/cookbook/*/index.md)
---
title: Dorm Carbonara
date: 2026-01-20
servings: 2
time: 20min
tags: [pasta, quick]
---

# Snippet (first line of source file)
// title: Tesla API poller
// tags: python, tesla, automation
// date: 2026-02-01
