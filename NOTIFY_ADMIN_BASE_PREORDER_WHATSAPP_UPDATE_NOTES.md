# Scentivity Notify Admin Base + Preorder WhatsApp Update

This package was rebuilt from the requested known-good `scentivity_website_notify_feedback_admin_update` base and the uploaded `index.html`.

Changes made:
- Updated the top promo strip to:
  - Delivery within 24 hrs
  - Secure Card and MoMo Payment
  - Great Deals Weekly
- Preorder form button now says: Send Request on WhatsApp.
- Preorder form now opens WhatsApp instead of email.
- Preserved the notify-feedback-admin setup:
  - app-cacheproof-notify-feedback-admin-20260604.js base functionality
  - Pending Customer Feedback admin section
  - data/pending-feedback.json
  - netlify/functions/submit-feedback.js
  - Notify Me popup behavior
- New cache-proof JS:
  - app-cacheproof-notify-admin-base-preorder-whatsapp-20260606.js

Deployment:
1. Upload everything inside `scentivity_site` to the GitHub repository root.
2. Confirm the repository root contains:
   - index.html
   - styles.css
   - app-cacheproof-notify-admin-base-preorder-whatsapp-20260606.js
   - data/
   - admin/
   - netlify/
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
4. After deploy, view page source and search for:
   app-cacheproof-notify-admin-base-preorder-whatsapp-20260606.js
