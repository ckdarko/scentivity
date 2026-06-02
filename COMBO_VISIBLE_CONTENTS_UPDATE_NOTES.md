# Scentivity Combo Visible Contents Update

Changes made:
- Combo cards now show the combo contents directly on the webpage, not only in the cart.
- Added a visible **Contains:** box for every combo card.
- Kept the detailed “What this combo contains” list for larger screens.
- Optimized the combo contents area for phone view so it does not overtake the full card.
- Kept the old crossed-out price, combo price, and save amount visible.
- Kept the Add Combo to Cart fix.
- Added a new cache-proof JavaScript file: `app-cacheproof-combo-visible-contents-20260601.js`.

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-combo-visible-contents-20260601.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit `https://scentivitygh.com/app-cacheproof-combo-visible-contents-20260601.js` and search for:
   `SCENTIVITY_COMBO_VISIBLE_CONTENTS_UPDATE_20260601`
