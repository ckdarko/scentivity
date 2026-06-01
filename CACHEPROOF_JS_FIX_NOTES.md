# Cacheproof JavaScript Fix

This package fixes cases where Netlify/browser cache keeps loading an old `script.js`.

What changed:
- Added a new JavaScript filename: `app-cacheproof-20260601.js`.
- `index.html` now loads that new file instead of `script.js`.
- Added a version marker inside the JavaScript: `SCENTIVITY_CACHEPROOF_JS_FIX_20260601`.
- Updated the static “How to order” text to match the current checkout: Card, MoMo, and Pay on pickup.
- Added a loading message in the slideshow area so it is clear whether JavaScript is loading.

After upload:
1. Upload all files from inside `scentivity_site` to GitHub.
2. Confirm GitHub has `app-cacheproof-20260601.js` at the same level as `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Open `https://scentivitygh.com/app-cacheproof-20260601.js` and search for `SCENTIVITY_CACHEPROOF_JS_FIX_20260601`.
5. If that marker appears, the live site is using this update.
