# Scentivity update notes

This updated version includes:

- Fused Scentivity logo based on the provided brand images.
- Contact details updated to:
  - WhatsApp: 054 113 2193
  - Call: 026 428 4238
  - Instagram: @scentivity
  - Website: scentivitygh.com
- Product request buttons now open WhatsApp instead of a placeholder email.
- A floating back-to-top button appears when visitors scroll down.
- A contact banner image has been added to the contact section.

## Important payment note

The website should not collect card numbers directly in a normal form. For secure payments, paste each product's Stripe Payment Link into the product entry in `/admin`. Stripe should collect card payment, customer name, phone, and delivery/shipping address. Scentivity can then view order and shipping details in Stripe.

## How to update the live site

Upload these extracted files to your existing GitHub repository and commit the changes. Netlify will redeploy automatically.
