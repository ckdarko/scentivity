# Scentivity Preorder WhatsApp and Promo Text Update

Changes made:
- Preorder / fragrance request form now sends to WhatsApp instead of email.
- The preorder button now says: Send Request on WhatsApp.
- Added a short note that the request opens WhatsApp for faster response.
- Updated the top promo text to:
  - Delivery within 24 hrs
  - Secure Card and MoMo Payment
  - Great Deals Weekly
- Added cache-proof JavaScript file: app-cacheproof-preorder-whatsapp-promo-20260604.js
- Added CSS cache busting in index.html.

Deployment:
1. Upload everything inside `scentivity_site` to GitHub.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
3. Verify:
   https://scentivitygh.com/app-cacheproof-preorder-whatsapp-promo-20260604.js
   Search for: SCENTIVITY_PREORDER_WHATSAPP_PROMO_UPDATE_20260604
