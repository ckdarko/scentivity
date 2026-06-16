# Scentivity Feedback Product Selector Dropdown Fix V2

This patch fixes the issue where clicking **Select products purchased** opens nothing.

## What changed

- The dropdown opens immediately when clicked.
- A loading message appears while site products load.
- Products are loaded from `data/products.json` or `products.json`.
- If product JSON is temporarily unavailable, it falls back to products already rendered on the page.
- Available, Incoming, and Out of Stock products are included.
- Combo/bundle items are excluded from the feedback selector.
- The old **Other product / combo not listed** field is removed if it still exists in a cached/deployed HTML version.
- The script uses a capture listener so older scripts cannot immediately close the product dropdown.

## Upload files

Upload:

- `index.html`
- `scentivity-feedback-products-site-only-v2-20260616.js`
- `FEEDBACK_SELECTOR_DROPDOWN_FIX_V2_NOTES.md`

Do not overwrite:

- `data/products.json`
- `assets/`
- `admin/config.yml`
- admin-uploaded product images/videos

Redeploy on Netlify with **Clear cache and deploy site**.
