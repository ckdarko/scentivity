# Scentivity Mobile UI Fixes Update

Fixes included:
1. Deal of the Week label now shows fully and is not covered by the bottle cap.
2. Fragrance Mists / Men’s Picks shortcut cards no longer drag to the right.
3. Search, Main Category, and Fragrance / Care Type filters wrap properly on small screens.
4. Combo Deal label is no longer covered by perfume images.
5. Add Built Bundle to Cart now has more robust mobile click/change handling.
6. Bundle builder summary/button is kept above the bottom mobile navigation.
7. Added cache-proof JS file: app-cacheproof-mobile-ui-fixes-20260602.js

Deployment:
- Upload everything inside `scentivity_site` to GitHub.
- Confirm `app-cacheproof-mobile-ui-fixes-20260602.js` appears beside `index.html`.
- Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
- Visit `https://scentivitygh.com/app-cacheproof-mobile-ui-fixes-20260602.js` and search for:
  `SCENTIVITY_MOBILE_UI_FIXES_UPDATE_20260602`
