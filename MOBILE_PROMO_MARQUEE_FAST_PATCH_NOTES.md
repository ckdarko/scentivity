# Scentivity Mobile Promo Marquee Fast Patch

This patch restores movement for the promo messages on mobile/tablet without adding JavaScript or heavy loading work.

It updates:
- `index.html`
- `product.html`
- `scentivity-mobile-promo-marquee-20260615.css`

What it does:
- Makes the homepage top promo strip move on mobile/tablet.
- Makes the product page promo strip move on mobile/tablet.
- Uses only a CSS `transform` animation.
- Does not affect products, images, video, cart data, admin settings, or product JSON.
- Respects `prefers-reduced-motion` for accessibility.

Upload only these changed files and redeploy using Netlify **Clear cache and deploy site**.

Do not overwrite:
- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded images/videos
