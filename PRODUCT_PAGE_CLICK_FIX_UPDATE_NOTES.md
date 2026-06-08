# Scentivity Product Page Click Fix Update

Changes made:
1. Product clicks now open a real product page: product.html?product=...
2. The product detail popup/modal was removed from the home page.
3. Product clicks no longer open Contact, Product Catalogue, Write Feedback, or Checkout.
4. The product page includes:
   - product photo
   - star rating
   - price
   - quantity selector
   - available quantity / stock
   - description/fragrance notes
   - overview/product information
   - ingredients
   - reviews/rating snapshot
   - other available products
5. Product page does NOT include Returns/Exchange info.
6. Admin now has:
   - Show Product on Website
   - Available / In Stock
   - Available Quantity / Stock
7. Products marked unavailable or hidden are removed from the home page/shop/product detail page.
8. Added product page files:
   - product.html
   - product-page-20260608.js

Upload these changed files:
- index.html
- styles.css
- script.js
- app-cacheproof-product-page-click-fix-20260608.js
- product.html
- product-page-20260608.js
- data/products.json
- admin/config.yml

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
