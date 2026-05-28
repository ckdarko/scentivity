# Scentivity Perfume Website

A polished website for **Scentivity** — **Everything Sweet Scented**.

This version includes:

- Updated fused Scentivity logo
- Contact details from the Scentivity brand card
- WhatsApp product-order buttons
- Product admin dashboard through `/admin`
- Product image, price, size, notes, and payment-link fields
- Floating **back-to-top** button that appears when visitors scroll down
- Netlify Forms contact form
- Stripe/checkout-link support for secure payments

## Current Business Details Used

- WhatsApp: `026 428 4238`
- Phone: `026 428 4238`
- Instagram: `@scentivity`
- Website: `scentivitygh.com`
- Motto: `Everything Sweet Scented`

## Important Files

```text
index.html                  Main public website
styles.css                  Website design and styling
script.js                   Product rendering, filters, WhatsApp buttons, back-to-top button
data/products.json          Product data edited by the admin dashboard
admin/config.yml            Admin dashboard configuration
assets/scentivity-logo-fused.png       Main updated logo
assets/scentivity-contact-banner.png   Contact section banner
SCENTIVITY_UPDATE_NOTES.md  Summary of this update
```

## How to Add Products Without Editing Code

Go to:

```text
https://your-site-name.netlify.app/admin/
```

Then:

1. Log in.
2. Open **Scentivity Store**.
3. Open **Products**.
4. Click **Add Product**.
5. Upload a perfume photo.
6. Enter product name, category, price, size, scent notes, availability, and optional checkout/payment link.
7. Click **Publish**.

## Secure Payment Note

Do **not** collect raw card numbers through a normal website form. Use a secure payment provider such as Stripe Payment Links. Paste the product's payment link into the product entry in `/admin`. Customers can then pay securely and provide their name, phone, and shipping details through the payment provider.

## How to Update the Live Site

Upload the extracted files to your existing GitHub repository, commit the changes, and Netlify will redeploy automatically.


## Updated Product Categories
Products now use two category fields:

- `mainCategory`: Victoria’s Secret, Bath & Body Works, Fragrances, Men’s Collection, Body Care, Home Fragrance, Gift Sets, or Others.
- `subCategory`: product type, such as Body Mist, Fine Fragrance Mist, Candles, Hand Soap, Hand Sanitizers, Body Lotion & Cream, Men’s Fragrance, etc.

In the `/admin` dashboard, add each product and choose both the main category and subcategory. The public shop page will automatically create filter buttons from these categories.
