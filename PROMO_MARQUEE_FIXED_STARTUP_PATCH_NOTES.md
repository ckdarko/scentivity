# Scentivity Promo Marquee Fixed Startup Patch — 2026-06-15

This patch is based on the `scentivity_mobile_homepage_video_startup_fast_patch` files and restores the moving promo strip on both the homepage and product page.

## Fix included
- Keeps homepage mobile/tablet video startup behavior.
- Keeps instant cart count/badge behavior.
- Rebuilds the promo text into a lightweight marquee track.
- Works around the mobile lightweight CSS that previously stopped animations globally.
- Uses one small deferred JavaScript file and one CSS file.
- Does not load images, videos, or product data.

## Upload these files
- `index.html`
- `product.html`
- `scentivity-mobile-video-startup-20260615.css`
- `scentivity-mobile-video-startup-20260615.js`
- `scentivity-cart-count-badge-fix-20260611.css`
- `scentivity-cart-count-badge-instant-20260615.js`
- `scentivity-promo-marquee-fixed-20260615.css`
- `scentivity-promo-marquee-fixed-20260615.js`
- `PROMO_MARQUEE_FIXED_STARTUP_PATCH_NOTES.md`

## Do not overwrite
- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded images/videos

## After upload
Use Netlify: Deploys → Clear cache and deploy site.

## Optional cleanup after this works
Delete old failed marquee files if they remain:
- `scentivity-mobile-promo-marquee-20260615.css`
- `scentivity-mobile-promo-marquee-v2-20260615.css`
- `scentivity-mobile-promo-marquee-stable-20260615.css`
