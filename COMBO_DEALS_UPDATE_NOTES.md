# Scentivity Combo Deals Update

Changes made:
- Added a new **Combo deals** section in the Shop area.
- Customers can select discounted combos and add them to the cart.
- Combo items show original price, combo price, and discount text such as “Save GH₵40”.
- Combos appear in the cart with a combo label and discount note.
- Checkout totals include combo discount prices.
- WhatsApp and Paystack order summaries now include combo details.
- Added combo management to `/admin` under Scentivity Store → Combo Deals.
- Added sample combos in `data/products.json`.
- Added a new cache-proof JavaScript file: `app-cacheproof-combo-deals-20260601.js`.

How to add/update combos:
1. Go to `/admin`.
2. Open **Scentivity Store**.
3. Edit **Combo Deals**.
4. Add combo name, included items, original price, combo discount price, discount text, image, and availability.
5. Publish.
6. In Netlify, use **Deploys → Trigger deploy → Clear cache and deploy site**.

Live verification:
Open `https://scentivitygh.com/app-cacheproof-combo-deals-20260601.js` and search for:
`SCENTIVITY_COMBO_DEALS_UPDATE_20260601`
