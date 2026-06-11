# Scentivity Paystack Compliance + Product Load More Update

This update was prepared from the uploaded `scentivity_customer_favorites_admin_toggle_update(1).zip` website files.

## What was missing for Paystack-style business website review
The uploaded site already had a shop/product catalogue, About modal, Contact/Preorder modal, Customer Feedback form, Ghana shipping modal, cart/checkout, and Paystack security notice.

The missing dedicated customer-protection pages were:
- FAQs
- Terms of Service
- Refund and Return Policy
- Privacy Policy
- Shipping and Delivery Policy

## What was added
- `faq.html`
- `terms-of-service.html`
- `refund-policy.html`
- `privacy-policy.html`
- `shipping-delivery-policy.html`
- A homepage Help & Policies section linking to the pages
- Footer policy links
- A product grid LOAD MORE button that initially shows 8 matching products and loads 8 more per click

## Live-site/admin safety
To avoid losing current live products, images, and videos uploaded through the admin page, upload only the changed files in the patch ZIP. Do not overwrite `data/products.json`, `assets/`, or admin-uploaded media unless you intentionally want to replace the live content.
