# Scentivity Purchase Count Auto Update Patch

This patch makes product purchase/bought counts update automatically after a successful Paystack purchase.

## Upload/replace only these files

- `index.html`
- `product.html`
- `scentivity-purchase-count-display-20260806.js`
- `netlify/functions/paystack-stock-webhook.js`

## Do not upload/replace

- `data/products.json`
- `assets/`
- `assets/products/uploads/`
- `admin/config.yml`

## What changed

1. `netlify/functions/paystack-stock-webhook.js`
   - After Paystack sends a successful `charge.success` webhook, the function now increments each purchased product's `purchaseCount` by the quantity purchased.
   - It still reduces `availableQuantity` as before.
   - Duplicate Paystack references are still skipped so the same payment cannot count twice.

2. `scentivity-purchase-count-display-20260806.js`
   - Reads the latest `data/products.json`.
   - Displays the bought/purchase count on product cards and product pages.
   - Shows `0 bought` for products with no purchases yet.

3. `index.html` and `product.html`
   - Adds the purchase count display script.

## Required setup

Keep your existing Netlify variables:

- `PAYSTACK_SECRET_KEY`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GITHUB_BRANCH`

Keep the Paystack Live Webhook URL:

`https://scentivitygh.com/.netlify/functions/paystack-stock-webhook`

## Test

1. Choose a product with a known `availableQuantity` and `purchaseCount`.
2. Buy quantity 1 using Paystack Card or MoMo.
3. Check GitHub → `data/products.json` → History.
4. You should see the product's `purchaseCount` increase by 1 and `availableQuantity` reduce by 1.
5. After Netlify deploys, refresh the site and confirm the product displays the updated bought count.
