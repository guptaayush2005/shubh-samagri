# Shubh Samagri — puja shop website

A responsive, multi-page puja samagri store with a product catalog, search and category pages, cart, checkout, COD orders, Razorpay checkout integration, and a password-protected store admin.

## Run it on your computer

1. Install Node.js 18 or later.
2. On Windows, double-click `start-local.bat`, or open this folder in a terminal and run:

   ```sh
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000).
4. Open [http://localhost:3000/admin.html](http://localhost:3000/admin.html) for the admin panel.
5. If you did not create a `.env` file, demo admin password is `shubh1234`. If you did, use the password you set in it.

The admin can add, edit, and remove products, update prices and stock, and update order status. Catalog and orders are saved in `data/products.json` and `data/orders.json`.

## Turn on online payments

Razorpay keys are never put in browser code. The server creates the payment order and verifies Razorpay's signature after payment.

1. Copy `.env.example` to `.env`.
2. In `.env`, set your Razorpay **test** key ID and test key secret first:

   ```env
   PORT=3000
   ADMIN_PASSWORD=choose-a-long-private-password
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

3. Restart `npm start`. Online payment will then appear at checkout. Use Razorpay's test credentials and test payment flow before adding live keys.
4. For real customers, replace test credentials with your own live keys, use HTTPS, and set a private admin password. Never share or commit `.env`.

Without Razorpay keys, online payment stays disabled and cash on delivery remains available. Order totals are calculated on the server from the current catalog prices. Delivery is ₹49 below ₹499 and free at ₹499 or more; change this in `server.mjs` to match your shop.

## Before publishing

- Change the demo password in `.env`.
- Add your real store name, phone/WhatsApp, address, service area, delivery timings, and return policy in the page files.
- Review the starter products, prices, stock, and descriptions in the admin panel.
- Keep `data/products.json` and `data/orders.json` backed up. This starter stores them as local JSON files, so host it on a Node server with persistent storage and run a single app instance.
- Add your own privacy, refund, shipping, and terms pages before accepting public orders.

This is a customizable starter store. The sample brand and catalog are placeholders, and real Razorpay payments require the shop owner's own approved merchant account and API keys.


