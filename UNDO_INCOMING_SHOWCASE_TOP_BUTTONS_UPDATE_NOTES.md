# Undo Incoming Showcase + Product Page Top Buttons Update

Changes made:
1. Undid the incoming-products slideshow update that caused "Available favorites and coming-soon scents" to show no products.
2. Restored the homepage showcase to load real products from data/products.json:
   - Available products first
   - Admin-set coming-soon products only if available=false
3. Removed the hamburger menu button from product pages.
4. Product page now shows only these top-right buttons:
   - Cart
   - Shop
   - About
5. Product page headings are:
   - Fragrance
   - Overview
   - Ingredients
   - Rating
6. Customer review placeholder/review-list text is removed from the product page.

Upload exact files:
- index.html
- styles.css
- script.js
- app-cacheproof-undo-incoming-showcase-top-buttons-20260608.js
- product.html
- product-page-not-popup-20260608.js

Then redeploy on Netlify with Clear cache and deploy site.
