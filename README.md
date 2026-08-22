# Laura Lee & Josh — Save the Date

**August 21, 2027 · Old Lyme, Connecticut**

Digital save-the-date. Single page, no build step, deploys to GitHub Pages.

---

## Running locally

Open `index.html` via a local server — loading it directly from the filesystem (`file://`) can cause font-loading issues with Google Fonts.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Config

Everything you'll need to change lives at the very top of `script.js`:

```js
// ─── CONFIG ────────────────────────────────────────────────
const WEDDING_DATE     = new Date('2027-08-21T16:00:00-04:00');
const ADDRESS_FORM_URL = '#'; // ← paste Google Form share link here
// ───────────────────────────────────────────────────────────
```

- **`WEDDING_DATE`** — Hardcoded with UTC offset so all time zones count down to the same moment (4 PM EDT). Update if ceremony time changes.
- **`ADDRESS_FORM_URL`** — Create a Google Form (Full name · Email · Street · City · State · ZIP · Country), open the share/prefill link, and paste it here. The button will open it in a new tab.

---

## Swapping photos

Replace the two files in `assets/`:

```
assets/photo-1.jpg   ← 4:5 portrait (e.g. 800 × 1000 px)
assets/photo-2.jpg   ← 4:5 portrait (e.g. 800 × 1000 px)
```

**Rules:**
- Keep the same filenames — nothing else needs to change.
- 4:5 portrait aspect ratio (e.g. 800 × 1000 px). Other ratios will be cropped to fit.
- Max 1200 px on the long edge; JPEG quality ~80 keeps weight low.
- Color or black-and-white — `filter: grayscale(100%) contrast(1.05)` is applied automatically in CSS, so color photos render in black-and-white automatically.

For the OG preview image (`assets/og-image.jpg`), replace with a 1200 × 630 JPEG. The current placeholder is a solid-color swatch; any image with the names and date will look better when the link is shared.

---

## Deployment — GitHub Pages

1. Push this directory to a GitHub repo (public or private).
2. **Settings → Pages → Source:** Deploy from a branch → `main` → `/ (root)`.
3. Site goes live at `https://<username>.github.io/<repo-name>/`.

All asset paths are **relative** (`assets/photo-1.jpg`, not `/assets/...`) so the site works on a project page URL without any changes.

**Custom domain (optional):** Add a `CNAME` file at the root containing only the bare domain (e.g. `joshandlauralee.com`), then point the domain's DNS to GitHub Pages' IPs. See [GitHub docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## File map

```
/
├── index.html       main page (all SVG inline)
├── styles.css       design tokens + all styles
├── script.js        countdown + animation + config
├── .nojekyll        prevents GitHub Pages from running Jekyll
└── assets/
    ├── photo-1.jpg  still life photo A (replace with real photo)
    ├── photo-2.jpg  still life photo B (replace with real photo)
    └── og-image.jpg link preview image (replace with real image)
```
