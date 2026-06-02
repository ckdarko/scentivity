# Scentivity Layout Cleanup Update

Changes made:
- Fixed the blank Now Showing slideshow by making slide rendering more robust and adding fallback images.
- Moved Search, Main Categories, and Fragrance / Care Type filters directly after Deal of the Week.
- Removed the large “Shop / Best sellers...” text block from the main page.
- Removed the shortcut and promotional banner sections that appeared between Deal of the Week and filters.
- Converted the 3 collections / 11 fragrance types / Instagram stats into a slideshow.
- Simplified combo cards by removing description and Contains text from the webpage cards.
- Kept combo contents in the cart/order summaries.
- Improved combo icon/image fit.
- Removed Email or WhatsApp Number field from the Preorder form.
- Converted How to Order into a compact slideshow.
- Removed the About Scentivity content from the main page and added an About button inside the header/hamburger menu that opens an About modal.
- Added cache-proof JS file: app-cacheproof-layout-cleanup-20260602.js

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-layout-cleanup-20260602.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit `https://scentivitygh.com/app-cacheproof-layout-cleanup-20260602.js` and search for:
   `SCENTIVITY_LAYOUT_CLEANUP_UPDATE_20260602`
