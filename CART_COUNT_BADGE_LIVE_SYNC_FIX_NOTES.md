# Scentivity cart count + product-card badge live sync fix

This is a safe add-on patch. It does not overwrite products, images, videos, Netlify CMS/admin data, or checkout logic.

## What it fixes

- After clicking **Add to Cart** on a product page, the cart count updates immediately.
- The cart count inside the menu updates immediately.
- The mobile/bottom cart icon count updates immediately.
- On the homepage/product cards, the small cart icon now shows a small badge number when that product is in the cart.

## Files included

- `index.html` — only adds the cart badge fix CSS/JS references.
- `product.html` — only adds the cart badge fix CSS/JS references.
- `scentivity-cart-count-badge-fix-20260611.js`
- `scentivity-cart-count-badge-fix-20260611.css`

## Upload instructions

Upload only the files in this ZIP. Do not overwrite or reupload:

- `data/products.json`
- `assets/`
- admin-uploaded product images/videos
- `admin/config.yml`, unless you are intentionally updating admin fields

After upload, redeploy on Netlify. If the old behavior remains, use **Clear cache and deploy site**.
