# Scentivity Homepage Products Restore Update

This fixes the issue where homepage products disappeared.

Cause fixed:
- The previous version treated "Available / In Stock = off" as "hide from the website".
- This update separates the two controls:
  1. Show Product on Website = controls whether a product appears on the site.
  2. Available / In Stock = controls whether buyers can add it to cart.

Changes made:
- Homepage/shop now shows every product where Show Product on Website is ON.
- Products that are out of stock can still show, but they show as Out of Stock / Notify Me instead of Add to Cart.
- Product cards still open product.html product pages, not popups.
- Product detail pages do not include Returns/Exchange info.
- Product detail pages display out-of-stock products if Show Product on Website is ON.
- Admin hints were clarified.

Upload these changed files:
- index.html
- styles.css
- script.js
- app-cacheproof-homepage-products-restore-20260608.js
- product.html
- product-page-restore-20260608.js
- data/products.json
- admin/config.yml

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
