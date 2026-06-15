# Scentivity instant cart response patch

This is a lightweight follow-up to the ultra-light mobile patch.

What it fixes:
- Cart count updates immediately when Add to Cart is tapped.
- Menu cart count updates immediately.
- Product page menu cart and bottom cart count update immediately.
- Homepage product-card cart icon badge appears immediately.
- The script reconciles with the real saved cart after the main cart code finishes.

Why it stays fast:
- No slideshow/video/image changes.
- No extra product rendering.
- No heavy observers or intervals.
- Uses one small script and requestAnimationFrame.
- Keeps the current lightweight mobile CSS and page layout.

Upload these files:
- index.html
- product.html
- scentivity-cart-count-badge-instant-20260615.js
- scentivity-cart-count-badge-fix-20260611.css
- INSTANT_CART_RESPONSE_PATCH_NOTES.md

Do not overwrite:
- data/products.json
- assets/
- admin/config.yml
- admin-uploaded product images/videos

After uploading, redeploy on Netlify with Clear cache and deploy site.
