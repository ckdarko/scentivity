# Scentivity Reviews, Bundle Toggle, and Checkout Cleanup Update

Changes made:
1. Deleted the highlighted 3 Main Collections / 11 Fragrance & Care Types / @scentivity slider from the main page.
2. Deleted the highlighted Pickup note / preferred pickup area field from checkout.
3. Build Your Own Bundle is deactivated by default.
4. Added an admin toggle for Build Your Own Bundle:
   - /admin → Scentivity Store → Products → Build Your Own Bundle
   - Toggle “Enable Build Your Own Bundle” on/off
   - Set discount percentages for 2 items and 3+ items
5. Removed all default Customer Love sample reviews from the website.
6. Added a customer feedback form.
7. Customer reviews only show on the website if they are added/approved in admin.
8. Added Customer Reviews list in /admin with an “Approved for Website” toggle.
9. Added a new cache-proof JS file: app-cacheproof-reviews-bundle-toggle-20260603.js

How review approval works:
- Buyers submit feedback through the website form.
- The review is not displayed automatically.
- Admin reviews the submission, then adds or approves it under Customer Reviews in /admin.
- Only reviews with Approved for Website = true appear on the website.
