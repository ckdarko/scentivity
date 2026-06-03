# Scentivity Deal of the Week Admin Update

Changes made:
- Added Deal of the Week settings to `/admin`.
- Admin can now choose whether Deal of the Week is:
  - a single product, or
  - a combo deal.
- Admin can type the exact Product Name or Combo Name to feature.
- Admin can edit Deal of the Week badge text, heading, description, button text, and optional image.
- Products and Combo Deals also include an optional “Set as Deal of the Week” toggle.
- The homepage Deal of the Week card now updates dynamically from `data/products.json`.
- The Deal button adds the selected product or combo directly to cart.
- Added a new cache-proof JavaScript file: `app-cacheproof-deal-of-week-admin-20260602.js`.

How to update Deal of the Week:
1. Go to `/admin`.
2. Open **Scentivity Store → Products → Deal of the Week**.
3. Choose **Single Product** or **Combo Deal**.
4. Enter the exact Product Name or Combo Name.
5. Update badge/heading/description/button text if desired.
6. Publish and redeploy if your Netlify setup does not auto-deploy.
