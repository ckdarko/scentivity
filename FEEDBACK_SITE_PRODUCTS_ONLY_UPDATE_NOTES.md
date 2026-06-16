# Scentivity Feedback Product Selector Update

This update changes the **WRITE FEEDBACK** product selector.

## What changed

- Removed **Other product / combo not listed**.
- The **Select products purchased** dropdown now shows only products from the site product data.
- It includes products regardless of stock/status:
  - Available
  - Incoming
  - Out of Stock / unavailable
- It excludes combo deals from the feedback product selector.
- It keeps working for products added later through admin because it reads `data/products.json`.
- It loads lazily so mobile speed is not affected.

## Upload files

Upload the files in this ZIP to the root of the GitHub repo.

## Do not overwrite

Do not overwrite:

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

## After upload

Redeploy on Netlify using **Clear cache and deploy site**.
