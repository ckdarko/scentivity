# Scentivity Lightweight Mobile Performance Patch — Full-code check update

This changed-files-only patch makes the current Scentivity site lighter on phones and tablets without changing admin settings, products, prices, uploaded content, cart behavior, Paystack pages, or the current visual layout.

## What I found in the code

The slow mobile loading was not only from images/video. The full code still had several performance issues that can slow phones even after deleting pictures and video:

1. `data/products.json` was fetched with a timestamp and `cache: no-store`, forcing a fresh uncached request on every visit.
2. Product cards could still try to load deleted image URLs from the product data, causing many slow 404 requests.
3. The public homepage loaded the Netlify Identity widget even though visitors do not need it; admin login still works from `/admin`.
4. Product cards and combo cards were rendered too aggressively instead of delaying real image loading.
5. The homepage video element still existed and could create mobile work even when the content was deleted.
6. Marquee/slider animations and heavy visual effects were still active on mobile.

## What this patch does

- Uses cached/revalidated product-data loading instead of a forced fresh request every visit.
- Keeps the existing Load More behavior so products render in smaller batches.
- Uses lightweight placeholders and lazy-loads real product images only when needed.
- Remembers missing/broken image paths locally so deleted images do not keep slowing repeat visits.
- Disables homepage video loading/autoplay on mobile/tablet.
- Removes the public homepage Netlify Identity widget; `/admin` remains the correct admin login path.
- Reduces mobile animation, hover, backdrop-filter, and shadow work.
- Adds Netlify cache headers for assets, CSS, JS, and product data.
- Keeps the cart count/product-card badge fix.
- Keeps Paystack compliance pages and policy links.

## Upload only these files

index.html
product.html
script.js
styles.css
product-page-not-popup-20260608.js
scentivity-showcase-rescue-20260609.js
scentivity-lightweight-mobile-20260615.css
scentivity-lightweight-mobile-20260615.js
scentivity-mobile-performance-20260614.css
scentivity-mobile-performance-20260614.js
scentivity-cart-count-badge-fix-20260611.css
scentivity-cart-count-badge-fix-20260611.js
faq.html
terms-of-service.html
refund-policy.html
privacy-policy.html
shipping-delivery-policy.html
netlify.toml
MOBILE_LIGHTWEIGHT_PERFORMANCE_PATCH_NOTES.md

## Do not overwrite

data/products.json
assets/
admin/config.yml
admin-uploaded product images/videos

## After upload

Use Netlify: Deploys → Trigger deploy → Clear cache and deploy site.
Then test on mobile in private/incognito mode first.
