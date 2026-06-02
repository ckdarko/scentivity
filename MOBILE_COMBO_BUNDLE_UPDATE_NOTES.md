# Scentivity Mobile Combo Details and Build-Your-Own-Bundle Update

Changes made:
- Forced combo details to show on mobile and small screens.
- Added visible **Contains:** information directly on every combo card.
- Added a **Build your own bundle** section where buyers can select products.
- Bundle discounts:
  - 2 items: 5% off
  - 3 or more items: 10% off
- Buyers can add their custom bundle to the cart.
- Custom bundle appears in cart with old/original total, discounted total, save amount, and selected product list.
- Added a new cache-proof JavaScript file: `app-cacheproof-mobile-combo-bundle-20260601.js`.

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-mobile-combo-bundle-20260601.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit `https://scentivitygh.com/app-cacheproof-mobile-combo-bundle-20260601.js` and search for:
   `SCENTIVITY_MOBILE_COMBO_BUNDLE_UPDATE_20260601`
