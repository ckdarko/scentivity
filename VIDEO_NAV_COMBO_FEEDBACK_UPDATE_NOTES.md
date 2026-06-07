# Scentivity Video, Nav, Combo Toggle, and Feedback Product Checkbox Update

Changes made:
1. Reduced the large space above the homepage video.
2. Made the top navigation buttons visible beside/near the logo as horizontally scrollable buttons.
3. Removed COMBOS from the top/header navigation list.
4. Added an admin toggle for the Combo Deals section:
   /admin → Scentivity Store → Products → Combo Deals Section → Show Combo Deals Section
5. Customer feedback now shows a checkbox list of products/combos purchased.
6. New products added in admin automatically appear in the feedback product checkbox list.
7. Added an “Other product / combo not listed” field.
8. Feedback submissions continue saving products purchased to pending feedback/admin.

New cache-proof JS:
app-cacheproof-video-nav-combo-feedback-20260607.js

Deploy:
1. Upload everything inside `scentivity_site` to the GitHub repository root.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
3. Confirm page source includes:
   app-cacheproof-video-nav-combo-feedback-20260607.js
