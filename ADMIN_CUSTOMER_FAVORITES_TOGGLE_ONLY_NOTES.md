# Scentivity Admin Customer Favorites Toggle Patch

Purpose:
- Adds the missing product admin toggle:
  "Show in Customer Favorites / Coming Soon Section"

Where it appears:
- Admin page > Products > open/edit a product
- It appears immediately after:
  "Show Product on Website"

What the toggle does:
- ON: product can appear in the homepage "Customer favorites / Available favorites and coming-soon scents" section.
- OFF: product stays in the main Product Catalogue/Shop but does not appear in that homepage favorites/coming-soon section.

Important upload instructions:
- Upload/replace only: admin/config.yml
- Do NOT upload/replace data/products.json
- Do NOT upload/replace assets/ or any admin-uploaded images/videos

Why this is safe:
- This patch changes only the Decap/Netlify CMS admin field list.
- It does not overwrite current products, images, videos, product data, or homepage rendering.

After upload:
- Redeploy on Netlify.
- Open /admin and hard-refresh the page.
- If the field still does not appear, clear browser cache or open /admin in an incognito/private window.
