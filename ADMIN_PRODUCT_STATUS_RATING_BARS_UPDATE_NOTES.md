# Admin Product Status + Rating Bar Counts Update

Admin changes:
1. Added Product Status dropdown for each product:
   - Available
   - Incoming
   - Out of Stock
2. Added separate rating bar controls for each product:
   - 5-star count
   - 4-star count
   - 3-star count
   - 2-star count
   - 1-star count

Website behavior:
- Available = product can be added to cart.
- Incoming = product can show as incoming/coming soon, but cannot be added to cart.
- Out of Stock = product shows unavailable/out of stock, but cannot be added to cart.
- Product page rating bars now use the admin star-count fields when they are filled in.

Upload exact files:
- index.html
- product.html
- script.js
- product-page-not-popup-20260608.js
- data/products.json
- admin/config.yml

Then redeploy on Netlify with Clear cache and deploy site.
