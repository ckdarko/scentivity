# Scentivity Combo Button Fix

This update fixes the **Add Combo to Cart** button.

Problem fixed:
- Combo cards displayed correctly, but the JavaScript click handler for combo buttons was missing.
- Product Add to Cart worked, but combo buttons did not add items to the cart.

What changed:
- Added a robust delegated click listener for every button with `data-combo-key`.
- Added a new cache-proof JavaScript file: `app-cacheproof-combo-button-fix-20260601.js`.
- Synced the fix into `script.js` as well.

Deployment:
1. Upload the contents inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-combo-button-fix-20260601.js` is beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Open `https://scentivitygh.com/app-cacheproof-combo-button-fix-20260601.js`.
5. Search for `SCENTIVITY_COMBO_BUTTON_FIX_20260601`.

After that, click **Add Combo to Cart**. The cart drawer should open and show the selected combo.
