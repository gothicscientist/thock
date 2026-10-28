# Product captures

These are real screenshots of the locally staged application using the committed catalog. They are not UI mockups. Retailer images may use the application's illustration fallback if a remote photo fails to load. Catalog prices and availability are a snapshot, not a live-stock guarantee.

## Reproduce

```sh
npm ci
npx playwright install chromium
npm run site:stage
node scripts/capture-showcase.mjs
```

The capture tool uses Chromium, light mode, reduced motion, a **1600 × 1000 CSS-pixel viewport** and **2× device scale**. It waits for initial network activity and fonts, then writes WebP screenshots from the actual rendered page. No external image responses are replaced with test fixtures.

| File | Route and state |
| --- | --- |
| `finder.webp` | `/`, fresh browser storage, no quiz answers, three featured boards visible |
| `builder.webp` | `/build`, opened using the Builder navigation control, default example build |

The optional `THOCK_BROWSER_EXECUTABLE` process variable can select an installed Chromium binary. The tool records page errors as a failure. Review images visually before committing; remote image timing can change their appearance.

## Optional interaction recording

Capture `/` at 1600 × 1000: choose 75%, Linear, then a sound and appearance; finish remaining questions; open matches; swap one part; copy a share link. Keep the complete input → result loop under 15 seconds and the final file under 5 MB. Save a reviewed recording as `docs/media/finder-demo.gif` before linking it from the README. No recording is currently included.

## GitHub surfaces

Suggested description: **Mechanical keyboard finder and builder with compatibility checks, store-sourced parts, and shareable builds.**

Suggested topics: `mechanical-keyboard`, `keyboard-builder`, `javascript`, `static-site`, `data-pipeline`, `github-pages`, `playwright`.

Repository description, topics and social-preview settings have not been changed by this presentation pass. For a custom social card, compose a 1280 × 640 image from a reviewed real capture and the project name; upload it through repository settings. The website's existing `assets/og.png` is a separate 1200 × 630 asset.
