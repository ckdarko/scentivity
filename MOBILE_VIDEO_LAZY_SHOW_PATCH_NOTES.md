# Scentivity Mobile Homepage Video Lazy-Show Patch

This patch re-enables the homepage video on mobile/tablet without reversing the mobile speed work.

## What changed

- The video section is no longer hidden on mobile.
- The video does not block the first page load.
- A lightweight poster/fallback shows first.
- The MP4 source is added only after the page is interactive, after idle time, or after the user interacts.
- The video uses `muted`, `playsinline`, and `preload="metadata"` after delayed loading so it can autoplay on most mobile browsers without loading too early.
- If autoplay is blocked by Low Power Mode/Data Saver, the fallback/poster remains visible instead of breaking the page.
- Cart-count instant response files are kept.

## Upload these files

- `index.html`
- `product.html`
- `scentivity-mobile-video-lazy-show-20260615.css`
- `scentivity-mobile-video-lazy-show-20260615.js`
- `scentivity-cart-count-badge-fix-20260611.css`
- `scentivity-cart-count-badge-instant-20260615.js`
- `MOBILE_VIDEO_LAZY_SHOW_PATCH_NOTES.md`

## Do not overwrite

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

## Important video upload guidance

For mobile speed, keep the homepage video short and compressed:

- MP4 or WebM
- ideally under 3–5 MB
- 720p or lower for mobile
- muted/autoplay-compatible

After upload, redeploy on Netlify using **Clear cache and deploy site**.
