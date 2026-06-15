# Scentivity Mobile/Product Promo Marquee V2

This patch fixes the promo strip on the product page when the lightweight mobile CSS stops animations.

## Upload these files

- `index.html`
- `product.html`
- `scentivity-mobile-promo-marquee-v2-20260615.css`
- `MOBILE_PRODUCT_PROMO_MARQUEE_V2_NOTES.md`

## Do not overwrite

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

## What changed

- Uses a stronger CSS-only marquee override for the product page.
- Keeps the homepage promo marquee moving.
- Does not add heavy JavaScript, fetches, timers, or image/video loading.
- Keeps the lightweight mobile speed changes.

After upload, redeploy with **Clear cache and deploy site**.
