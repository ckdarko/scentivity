# Scentivity Ultra-Light Mobile Cleanup Patch — 2026-06-15

Purpose: make the public site lighter on phones/tablets without changing admin data, product settings, uploaded products, Paystack pages, cart, or the visual structure.

What changed:
- Main `script.js` is now deferred from `index.html` so the page can paint before JavaScript runs.
- Removed runtime loading of extra performance/rescue scripts from the homepage and product page.
- Replaced the heavier cart badge script with `scentivity-cart-count-badge-fix-20260615-lite.js`.
- Product data now uses normal browser cache instead of forced `no-cache` on every mobile visit.
- Above-the-fold sections render first; combos, bundle builder, video, reviews, and lower-page content hydrate later/on idle.
- Feedback product checkboxes are delayed until the customer opens feedback.
- Mobile autoplay timers/sliders are disabled to reduce CPU use.
- Mobile CSS disables expensive animations, backdrop filters, heavy transitions, and video rendering.
- Old mobile performance/rescue JS files are overwritten as no-op files in case older pages still reference them.
- Netlify cache headers improved for JS/CSS/assets and short product-data revalidation.

Upload these changed files. Do not overwrite:
- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

Strong cleanup recommendation:
After confirming the site works, delete unused root-level old patch scripts such as `app-cacheproof-*.js` and old `*_NOTES.md` files from GitHub. They usually do not slow the page unless loaded, but they make deployments confusing and increase the chance of accidentally reusing old code.

Test steps:
1. Upload files to GitHub.
2. Netlify: Deploys > Clear cache and deploy site.
3. Open the site on phone in private/incognito mode.
4. Test: menu, Product Catalogue, Add to Cart, checkout panel, product detail page, feedback modal, policy links.
