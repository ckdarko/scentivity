# Scentivity Cart and Payment Setup Guide

This update adds a full cart checkout flow to the website:

- Buyers can add multiple products to cart.
- Buyers can choose pickup or delivery.
- Buyers can enter name, email, phone number, address, pickup note, and extra notes.
- Buyers can choose a payment method.
- Manual payment methods open a WhatsApp order summary to Scentivity.
- Online card/Mobile Money checkout is prepared through Paystack and Netlify Functions.

## Important security note

Do not collect card numbers, expiry dates, CVV, or raw Mobile Money PINs directly on the Scentivity website. The secure setup is to redirect buyers to a payment processor checkout page such as Paystack or Flutterwave.

## Payment methods in this code

1. Pay online now: Card or Mobile Money
   - Uses `netlify/functions/create-paystack-checkout.js`.
   - Requires a Paystack account and a Netlify environment variable named `PAYSTACK_SECRET_KEY`.

2. Mobile Money confirmation by WhatsApp
   - Opens WhatsApp with the order details.
   - Scentivity can manually send MoMo instructions or a payment link.

3. Bank transfer / deposit confirmation
   - Opens WhatsApp with the order details.

4. Pay on pickup
   - Opens WhatsApp with the order details.

5. Cash on delivery, if available
   - Opens WhatsApp with the order details.

## Paystack setup steps

1. Create or log in to a Paystack business account for Ghana.
2. Complete business verification and settlement account setup.
3. In Paystack Dashboard, go to Developers / API Keys.
4. Copy the Secret Key. Use the live secret key only when you are ready to receive real payments.
5. In Netlify, open the Scentivity site.
6. Go to Site configuration / Environment variables.
7. Add this variable:

   PAYSTACK_SECRET_KEY = your_paystack_secret_key_here

8. Redeploy the site using:

   Deploys → Trigger deploy → Clear cache and deploy site

9. Test the cart checkout.

## Where admin sees orders

When Paystack checkout is used, order details are sent as Paystack transaction metadata. Check the Paystack Dashboard under Transactions/Payments and open the transaction details. The metadata includes customer name, phone, pickup/delivery choice, address, cart items, and notes.

## Recommended first test

Use Paystack test mode first, then switch to live keys when everything is working.
