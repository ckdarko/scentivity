# Force Product WhatsApp Request Update

This update forces the **Send Request** button inside each product card in the Shop section to open WhatsApp instead of email.

WhatsApp number used:
- Local: 053 458 4470
- International/WhatsApp link: +233 53 458 4470
- Link format: https://wa.me/233534584470

Important deployment note:
- `index.html` now loads `script.js?v=force-product-whatsapp-0534584470` so browsers do not keep using an older cached script file.
- Product card buttons now read **Send Request on WhatsApp** so it is clear what will open.
- General email/contact buttons remain email-based.
