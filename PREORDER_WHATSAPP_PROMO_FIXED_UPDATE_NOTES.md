# Scentivity Preorder WhatsApp + Promo Text FIXED Update

This package starts from the known-good `scentivity_website_notify_feedback_admin_update.zip` base and preserves those updates.

Preserved:
- Notify Me opens Contact/Preorder popup and prefills coming-soon product.
- Pending Customer Feedback admin section.
- data/pending-feedback.json.
- netlify/functions/submit-feedback.js.
- Customer feedback form no longer opens a 404 page.
- Removed public approval placeholder messages.

New changes:
- Preorder / Send Request now opens WhatsApp instead of email.
- Button says: Send Request on WhatsApp.
- Top promo text changed to:
  - Delivery within 24 hrs
  - Secure Card and MoMo Payment
  - Great Deals Weekly

New cache-proof JS:
- app-cacheproof-notify-feedback-preorder-whatsapp-promo-20260604.js

Deploy:
1. Upload everything inside `scentivity_site` to GitHub.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
3. Verify:
   https://scentivitygh.com/app-cacheproof-notify-feedback-preorder-whatsapp-promo-20260604.js
   Search for:
   SCENTIVITY_NOTIFY_FEEDBACK_PREORDER_WHATSAPP_PROMO_FIXED_20260604
