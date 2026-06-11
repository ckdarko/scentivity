# Scentivity Safe Recovery Patch — June 11, 2026

This patch is intended to recover the site if the previous upload made the homepage/buttons unresponsive.

## What changed
- Restores the stable `script.js` and `styles.css` from the uploaded working ZIP.
- Adds Paystack-required policy pages and homepage/footer links.
- Adds a separate safe JavaScript patch for:
  - LOAD MORE on the product grid.
  - Immediate cart count refresh after Add to Cart.
  - Number badge on product cart icons when that product is in the cart.

## What this patch does NOT include
- No `data/products.json`
- No `assets/` folder
- No admin-uploaded images or videos

This means the live admin products, images, and videos should remain untouched.

## Upload these files
Upload all files in this ZIP to the same folder as your current `index.html`.

After uploading, redeploy on Netlify using **Clear cache and deploy site**.
