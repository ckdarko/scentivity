# Scentivity Cart Reliability + Single Product Deal Update

Changes made:
1. Fixed cart storage initialization so products stay in cart after page reload.
2. Made cart buttons open the cart reliably:
   - Header/menu Cart
   - Footer Cart
   - Mobile bottom Cart
3. Changed Deal of the Week to use a single product by default, not a combo.
4. Made all Add to Cart / Add Deal to Cart / Add Combo to Cart buttons use a high-priority click handler.
5. Prevented Add to Cart taps from accidentally bubbling into Contact/Preorder/menu handlers.
6. Improved mobile tap response for the menu button.
7. Added mobile padding/z-index fixes so fixed bottom navigation is less likely to sit over Add to Cart buttons.
8. Updated admin/data defaults for Deal of the Week.

Upload these changed files:
- index.html
- styles.css
- script.js
- app-cacheproof-cart-reliability-single-deal-20260608.js
- data/products.json
- admin/config.yml

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
