# Scentivity Medium Menu Fix

Changes made:
- Fixed menu display so it opens as a medium top-right dropdown/popup, not a huge full-height panel.
- Reduced menu width, height, search bar, and text size.
- Removed the Ghana flag / gh from ABOUT US.
- Kept menu items:
  - SHOP
  - PREORDER
  - PRODUCT CATALOGUE
  - ABOUT US
  - CART
- Added CSS cache busting.

Changed files only:
- index.html
- styles.css

Deploy:
1. Upload only `index.html` and `styles.css` to GitHub repository root if the previous update is already uploaded.
2. Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
