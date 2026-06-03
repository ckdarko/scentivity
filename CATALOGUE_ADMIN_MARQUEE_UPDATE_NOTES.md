# Scentivity Catalogue Admin and Hero Marquee Update

Changes made:
- Restructured the homepage highlight text into a slow-moving marquee.
- Highlight text now reads:
  - Everything Sweet Scented
  - Victoria’s Secret. Bath & Body Works. luxury fragrances
  - Pickup. delivery. secure checkout options.
- Added admin-editable Product Catalogue / Categories.
- Admin can now add new catalogue button names and subcategories from `/admin`.
- Product Main Category is now editable as a text field, so new catalogue names can be used.
- Product Fragrance / Care Type is now editable as a text field, so new subcategories can be used.
- The Product Catalogue popup reads catalogue names and subcategories from `data/products.json`.
- Added a new cache-proof JavaScript file: `app-cacheproof-catalogue-admin-marquee-20260603.js`.

How to add a new catalogue/category:
1. Go to `/admin`.
2. Open **Scentivity Store → Products → Product Catalogue / Categories**.
3. Add a new catalogue item.
4. Enter:
   - Catalogue Button Label, e.g. `ARABIAN SCENTS`
   - Category Name Used by Products, e.g. `Arabian Scents`
   - Subcategories, e.g. `Perfume Oil`, `Eau de Parfum`, `Gift Sets`
5. For products under that catalogue, type the same Category Name in the product’s **Main Category** field.
