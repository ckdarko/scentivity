# Header Nav Visible Fix

Changes made:
- Fixed mobile header so the visible top navigation starts from Shop instead of only showing Cart.
- Header now keeps visible buttons for: Shop, Preorder, Product Catalogue, About, Cart.
- Header navigation can wrap neatly on small screens instead of hiding items off-screen.
- Reduced mobile logo size and button spacing so the buttons appear close to the logo.
- Added CSS cache busting in index.html.

Changed files only:
- index.html
- styles.css

Deploy:
1. Upload only `index.html` and `styles.css` to the GitHub repository root if you already uploaded the previous update.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
