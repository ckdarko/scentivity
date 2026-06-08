# Products / Shop / Feedback Fix

Fixes included:
1. Homepage products now appear immediately because product cards are written directly into index.html and also rendered by JS.
2. Shop the collection is forced to scroll to Products and should not open Contact.
3. Product cards open product.html pages, not popups or Contact/Catalogue/Feedback.
4. Approved feedback can now show from:
   - data/products.json → customerReviews
   - data/pending-feedback.json → pendingFeedback marked approved
   - approved values true, "true", "yes", "approved", "published"
5. Show Product on Website controls whether a product appears.
6. Available / In Stock controls whether buyers can add to cart.
7. Product page has no returns/exchange section.

Upload exact files:
- index.html
- styles.css
- script.js
- app-cacheproof-products-shop-feedback-fix-20260608.js
- product.html
- product-page-products-shop-feedback-fix-20260608.js
- data/products.json
- data/pending-feedback.json
- admin/config.yml
