# Scentivity Payment and Order Setup

This version supports secure checkout links for each product. The recommended all-free-to-start workflow is:

1. Host the website on Netlify from GitHub.
2. Manage products from `/admin` using Decap CMS.
3. Create a Stripe Payment Link for each perfume.
4. Configure Stripe to collect the customer name, email, phone number, billing address, shipping address, and card payment.
5. Paste each Stripe Payment Link into the product entry inside `/admin`.

## Important security note

Do not collect or store card numbers, CVV codes, or full card details directly on the Scentivity website. Let Stripe handle card collection and payment processing. Scentivity should only see order details needed for fulfillment, such as product purchased, buyer name, email, phone number, shipping address, payment status, and receipt/order number.

## Create a Stripe Payment Link

1. Create or sign in to a Stripe account.
2. Go to **Payment Links**.
3. Click **New**.
4. Add the perfume product and price.
5. Enable customer information fields such as email and phone number.
6. Enable billing and shipping address collection.
7. Add shipping rates if needed.
8. Save and copy the payment link.

## Add the link to Scentivity

1. Go to `https://your-site-name.netlify.app/admin/`.
2. Open **Scentivity Store > Products**.
3. Select a product or click **Add Product**.
4. Paste the Stripe URL into **Stripe Payment Link / Checkout URL**.
5. Click **Publish**.

The public product card will show **Buy now** when a payment link exists. Every available product also shows **Send Request**, which opens a prefilled email to scentivitygh@gmail.com.

## Where the admin sees orders

Paid orders, customer names, addresses, and payment status are visible in the Stripe Dashboard. Contact form messages are visible in Netlify under **Forms**.
