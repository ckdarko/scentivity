# Scentivity Perfume Website

A polished static website for **Scentivity**, a ladies' perfume selling business. It includes:

- A custom SVG logo
- Responsive homepage
- Featured products section
- Product category filters
- Product image, price, size, notes, and order-request buttons
- About, ordering steps, contact section, and business information
- Free deployment instructions

## File Structure

```text
scentivity_site/
├── index.html
├── styles.css
├── script.js
├── DEPLOYMENT_STEPS.md
└── assets/
    ├── logo.svg
    ├── favicon.svg
    └── products/
        ├── velvet-rose.svg
        ├── amber-noir.svg
        ├── citrus-bloom.svg
        └── oud-muse.svg
```

## How to Edit Business Information

Open `index.html` and update these placeholders:

- Email: `hello@scentivity.com`
- Phone: `+1 (000) 000-0000`
- Instagram: `@scentivity`
- Business hours
- Business location, if you want to add one
- Delivery, pickup, and payment information

## How to Add or Edit Products

Open `script.js`. At the top, you will see the product list:

```js
const products = [
  {
    name: 'Velvet Rose Eau de Parfum',
    category: 'Floral',
    price: '$45',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Rose petals, peony, soft musk, and vanilla cream.',
    size: '50 mL'
  }
];
```

To add a new perfume:

1. Put the perfume photo in `assets/products/`.
2. Copy one product block.
3. Paste it below the last product.
4. Change `name`, `category`, `price`, `image`, `notes`, and `size`.
5. Save the file.
6. Redeploy or upload the updated folder.

Example:

```js
{
  name: 'Midnight Jasmine',
  category: 'Floral',
  price: '$52',
  image: 'assets/products/midnight-jasmine.jpg',
  notes: 'Jasmine, pear, vanilla orchid, and soft musk.',
  size: '50 mL'
}
```

Supported product categories in the current filter buttons are:

- Floral
- Warm
- Fresh
- Luxury

You can add more categories by adding a new filter button in `index.html` and using the same category name in `script.js`.

## Recommended Product Photo Size

Use square images for best results:

- 1000 × 1000 px, JPG, PNG, or WebP
- Clear perfume bottle photo
- Bright background or clean lifestyle setting
- Consistent style for all products

## Contact Form Note

The current contact form uses `mailto:`, which opens the customer's email app. This works for a simple free static website. For a more professional form later, you can connect Formspree, Netlify Forms, Google Forms, or a backend service.

## Free Hosting Options

See `DEPLOYMENT_STEPS.md` for GitHub Pages, Netlify, and Vercel instructions.
