# Josh & Laura — Save the Date

**August 21, 2027 · 5 PM**

A single-page, animated save-the-date invitation styled as a tactile paper-collage poster. Plain static HTML/CSS/JS, no build step, no framework — deploys straight to GitHub Pages.

---

## Running locally

Open `index.html` via a local server — loading it directly from the filesystem (`file://`) can cause local font-loading issues in some browsers.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

There is no build step; the files in the repo root are the production output.

---

## Where to edit content

All visible copy (names, date, time, headline) lives directly in `index.html` inside `<article class="poster">`. There's no config file or template — edit the text nodes in place:

- Headline lines (`SAVE` / `THE` / `DATE`) — the three `.headline-line` spans.
- Names — the two `.name-line` spans ("Josh" / "& Laura").
- Date/time — the `.td-group` block, plus the screen-reader-only `<time datetime="2027-08-21">` element right after it. Keep both in sync if the date or time ever changes.
- `<title>` and the `<meta name="description">` / Open Graph / Twitter tags at the top of `<head>`.

## Where to replace the photo

Swap the `src` on the single `<img id="couple-photo">` element in `index.html` (inside `.photo-aperture`):

```html
<img id="couple-photo" class="photo-img" src="assets/photo-placeholder.svg" ...>
```

Point `src` at a real photo (e.g. `assets/couple.jpg`). Notes:
- The image is shown with `object-fit: cover` inside a fixed portrait aperture; adjust the inline `object-position` style on the same tag to change the crop focus (default is centered, `50% 50%`).
- A `grayscale(100%) contrast(1.05)` filter is applied in `styles.css` (`.photo-img`), so a full-color photo will automatically render in the poster's monochrome style — no layout changes needed.
- The `onerror` handler on the tag falls back to `assets/photo-placeholder.svg` automatically if the new image fails to load, so the poster never shows a broken-image icon.
- `assets/photo-1.jpg` and `assets/photo-2.jpg` are real photos left over from the previous design; they are no longer referenced anywhere and can be deleted or reused as you like.

## Where animation timings live

The entrance sequence is driven entirely by CSS (`styles.css`, "Entrance animation" section) — each animated element has a `[data-anim="..."]` attribute, and its reveal timing is set via `transition-delay`/`transition-duration` on `.poster.is-playing [data-anim="..."]`. `script.js` only toggles the `.is-playing` class (once on load, and again on each "Replay animation" click) — it contains no timing values itself.

To change timing, edit the `transition` lines in that CSS section. To change the poster's layout/positions, edit the `cqw`/`cqh` values in the per-layer rules (`.photo-frame`, `.headline`, `.names-strip`, `.timedate`) — they're derived from a 360×640 reference grid documented in a comment at the top of the file.

---

## Deployment — GitHub Pages

This repo's existing Pages setup is unchanged:

- `CNAME` (custom domain) and `.nojekyll` are preserved at the repo root.
- All asset paths are **relative** (`assets/...`, not `/assets/...`), so the site works whether it's served from a custom domain root or a GitHub Pages project subdirectory.
- No routing, server, or build step is required — push the updated files and Pages serves them as-is.

---

## File map

```
/
├── index.html                       poster markup (progressive enhancement: fully readable without JS)
├── styles.css                       design tokens, layout, paper texture, animation
├── script.js                        entrance-animation + replay controller (no timing values)
├── .nojekyll                        prevents GitHub Pages from running Jekyll
├── CNAME                            custom domain
└── assets/
    ├── fonts/
    │   ├── anton-latin.woff2        headline + date/time typeface
    │   └── pinyon-script-latin.woff2  script name typeface
    ├── paper-texture.svg            generated crumpled-paper background
    ├── paper-grain.svg              fine grain overlay (frame + name strip)
    ├── photo-placeholder.svg        "Photo coming soon" placeholder — see above to replace
    ├── og-image.jpg                 link-preview image (placeholder; replace with a real 1200×630 image)
    └── photo-1.jpg, photo-2.jpg     unused leftovers from the previous design
```

---

## Notes on fonts

Anton and Pinyon Script are both licensed under the SIL Open Font License and are vendored locally as `.woff2` files under `assets/fonts/` (downloaded from Google Fonts) — no external font requests at runtime. If a browser can't load them for any reason, `styles.css` falls back to `'Arial Narrow', sans-serif` for the headline/date-time and `'Brush Script MT', cursive` for the names.
