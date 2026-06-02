# Scentivity Deal of the Week Update

Changes made:
- Deleted/replaced the homepage perfume bottle image section.
- Added a homepage **Deal of the Week** card in its place.
- The Deal of the Week pulls from Combo Deals.
- The combo marked `dealOfWeek: true` displays on the homepage.
- If none is marked, the first available combo is displayed.
- Added **Add Deal to Cart** button.
- Added **See all combos** button.
- Added `/admin` field: **Feature as Deal of the Week** under Combo Deals.
- Added cache-proof JavaScript file: `app-cacheproof-deal-of-week-20260601.js`.

How to change the Deal of the Week:
1. Go to `/admin`.
2. Open **Scentivity Store**.
3. Open **Combo Deals**.
4. Turn on **Feature as Deal of the Week** for the combo you want.
5. Publish.
6. Redeploy on Netlify using **Clear cache and deploy site**.

Live verification:
Open `https://scentivitygh.com/app-cacheproof-deal-of-week-20260601.js`
Search for:
`SCENTIVITY_DEAL_OF_WEEK_UPDATE_20260601`
