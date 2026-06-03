# Scentivity Product Catalogue and Shipping Update

Changes made:
- Moved Main Categories and Fragrance / Care Type filters into a Product Catalogue popup.
- Main page search area now has buttons for Product Catalogue and Shipping Countries.
- Added Product Catalogue and Shipping Countries buttons to the hamburger/menu.
- Renamed category filter heading to PRODUCT CATALOGUE.
- Updated category buttons to:
  ALL | BBW | VICTORIA SECRET | DESIGNER FRAGRANCE | GIFT SETS | COMBOS
- Combo category button now opens the Combo Deals section.
- Updated hero floating highlight text:
  Everything Sweet Scented
  Victoria’s Secret. Bath & Body Works. luxury fragrances
  Pickup. delivery. secure checkout options.
- Removed old/original price display from combo cards and combo cart items.
- Added Shipping Countries popup.
- Set Ghana as the only currently supported delivery country.
- Added Ghana-only shipping country field during checkout.
- Other countries show: “Sorry, we can’t ship to this country now. When available, we will notify you. Enter your details in Contact.”
- Added cache-proof JS file: app-cacheproof-catalogue-shipping-20260602.js

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-catalogue-shipping-20260602.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit `https://scentivitygh.com/app-cacheproof-catalogue-shipping-20260602.js` and search for:
   `SCENTIVITY_CATALOGUE_SHIPPING_UPDATE_20260602`
