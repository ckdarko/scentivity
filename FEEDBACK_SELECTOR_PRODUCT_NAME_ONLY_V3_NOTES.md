# Scentivity Feedback Product Selector – Product Name Only Patch

## What changed

This patch updates the **Write Feedback → Select products purchased** dropdown so each option displays only the product name.

Example before:

```text
Bath & Body Works A Thousand Wishes • Bath & Body Works • 236 mL • Available
```

Example after:

```text
Bath & Body Works A Thousand Wishes
```

## Behavior kept

- Products are loaded from the site product data.
- Future products added through the admin page will appear automatically.
- Available, Incoming, and Out of Stock products are included.
- Combo/bundle items are excluded.
- The old **Other product / combo not listed** field remains removed.
- Mobile speed is not affected; the selector still loads lazily.

## Files included

```text
index.html
scentivity-feedback-products-site-only-v3-20260616.js
FEEDBACK_SELECTOR_PRODUCT_NAME_ONLY_V3_NOTES.md
```

## Do not overwrite

```text
data/products.json
assets/
admin/config.yml
admin-uploaded images/videos
```

After uploading, redeploy with **Clear cache and deploy site**.
