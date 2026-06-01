# Scentivity Checkout Refinement

Changes made:
- Payment methods reduced to:
  1. Card
  2. MoMo
  3. Pay on pickup
- Removed Email from Buyer Information.
- Kept Full name and Phone / WhatsApp number as required buyer details.
- Added a Delivery fee (GH₵) field that appears under Delivery.
- Cart totals now show Subtotal, Delivery fee, and Total.
- Card payments open Paystack with the card channel.
- MoMo payments open Paystack with the mobile money channel.
- Pay on pickup opens WhatsApp with the order summary.
- Optimized Pickup / Delivery buttons so they display cleanly on phones.
- Updated homepage slideshow text to be buyer-facing.

Important:
- Paystack requires an email internally. Since the buyer email field was removed, the Netlify Function creates a safe placeholder email from the customer phone number for Paystack checkout initialization. Scentivity still receives the buyer name, phone, address, fulfillment type, delivery fee, and order details in the transaction metadata.
