# Scentivity Mobile Homepage Video Startup Patch

This patch re-enables the homepage video on phones/tablets and starts it shortly after first paint.

It keeps the mobile opening speed by:

- showing the poster/fallback first
- keeping `preload="none"` in the HTML
- adding the video source with JavaScript after the page is usable
- playing muted + playsinline for mobile autoplay support
- keeping instant cart-count response files included

## Upload only

- `index.html`
- `product.html`
- `scentivity-mobile-video-startup-20260615.css`
- `scentivity-mobile-video-startup-20260615.js`
- `scentivity-cart-count-badge-fix-20260611.css`
- `scentivity-cart-count-badge-instant-20260615.js`
- `MOBILE_VIDEO_STARTUP_FAST_PATCH_NOTES.md`

## Do not overwrite

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

## Important

The video must be compressed. Recommended homepage video:

- MP4 or WebM
- muted autoplay compatible
- 5–10 seconds
- 720p or lower for mobile
- ideally under 3–5 MB

If the phone is in Low Power Mode or Data Saver mode, some browsers may block autoplay. In that case, the poster/fallback remains visible and the video starts after the first tap/scroll.
