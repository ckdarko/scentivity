# Scentivity Mobile Speed Optimization Patch

This changed-files-only patch keeps the current live design and admin content intact.

## What changed

- Keeps the cart count/product badge fix already included in the previous ZIP.
- Adds a small performance helper script:
  - delays homepage video loading on mobile
  - keeps the video poster visible first
  - avoids video download on data-saver / reduced-motion devices until user interaction
  - lazy-loads non-critical images added by homepage/product scripts
  - adds async image decoding where safe
- Adds a small performance helper CSS file for lighter mobile rendering.
- Updates the homepage video from `preload="auto"` to `preload="none"` and moves the video file URL to `data-src` so it does not immediately download before the page is interactive.

## Upload these files

- `index.html`
- `product.html`
- `scentivity-cart-count-badge-fix-20260611.js`
- `scentivity-cart-count-badge-fix-20260611.css`
- `scentivity-mobile-performance-20260614.js`
- `scentivity-mobile-performance-20260614.css`
- `CART_COUNT_BADGE_LIVE_SYNC_FIX_NOTES.md`
- `MOBILE_SPEED_VIDEO_IMAGE_OPTIMIZATION_NOTES.md`

## Do not overwrite

- `data/products.json`
- `assets/`
- admin-uploaded images
- admin-uploaded videos
- `admin/config.yml`

## After upload

Redeploy on Netlify using **Clear cache and deploy site**.

## Notes

This patch does not compress existing uploaded images or videos. It only makes the browser load them more carefully. For the biggest improvement, compress the homepage video and large product photos later, but that can be done separately without changing products or admin data.
