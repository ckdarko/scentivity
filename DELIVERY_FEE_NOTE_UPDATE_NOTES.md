# Scentivity Delivery Fee Note Update

Changes made:
- Removed the delivery fee input from checkout.
- Removed delivery fee from the cart total calculation.
- Added this note: “Delivery fee applies to delivery orders and will be determined after checkout based on your location.”
- Updated the payment security note to say Card and MoMo payments open through Paystack.
- Updated the About Scentivity checklist wording.
- Added a new cache-proof JavaScript file: app-cacheproof-delivery-note-20260601.js.

Deployment:
1. Upload all files inside `scentivity_site` to GitHub.
2. Confirm `app-cacheproof-delivery-note-20260601.js` appears beside `index.html`.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. Visit https://scentivitygh.com/app-cacheproof-delivery-note-20260601.js and search for SCENTIVITY_DELIVERY_FEE_NOTE_UPDATE_20260601.
