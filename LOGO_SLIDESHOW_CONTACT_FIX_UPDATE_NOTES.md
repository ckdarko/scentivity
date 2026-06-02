# Scentivity Logo, Slideshow, Contact Popup, and Bundle Fix Update

Changes made:
- Updated the website logo using the newly uploaded Scentivity logo.
- Replaced the existing logo asset files:
  - assets/scentivity-logo-fused.png
  - assets/scentivity-logo.png
- Fixed the blank Now Showing slideshow with stronger image fallbacks and mobile display rules.
- Fixed Customer Love review cards so messages remain visible.
- Removed the browser alert that says “Please select at least 2 products to build a bundle.”
- Improved Build Your Own Bundle selection detection by reading selected checkboxes directly.
- Removed the Contact section from the main page.
- Added Contact as a popup/modal, similar to the About popup.
- Made header Contact and Preorder buttons open the popup.
- Made the bottom mobile Contact button open the popup.
- Kept the Preorder form inside the Contact popup.
- Added a new cache-proof JS file: app-cacheproof-logo-slideshow-contact-fix-20260602.js

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-logo-slideshow-contact-fix-20260602.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit `https://scentivitygh.com/app-cacheproof-logo-slideshow-contact-fix-20260602.js` and search for:
   `SCENTIVITY_LOGO_SLIDESHOW_CONTACT_FIX_UPDATE_20260602`
