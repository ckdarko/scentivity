# Product Send Request WhatsApp Update

This update keeps general email contact/request buttons as email-based, but changes the **Send Request** button inside each product card in the Shop/product display area to open WhatsApp.

## WhatsApp number used

- Visible WhatsApp number: `053 458 4470`
- WhatsApp link format: `https://wa.me/233534584470`
- Call number remains unchanged: `026 428 4238`

## Files updated

- `script.js`
  - Product-card request button uses `buildWhatsAppLink(...)`.
  - Product request message includes product name, brand, category, size, price, quantity, customer name, phone number, and delivery/pickup preference.

- `index.html`
  - Contact section keeps WhatsApp as a separate contact card.
  - General request/contact buttons remain email-based.

