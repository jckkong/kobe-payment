# Kobe Payment

## Scenario

I am a Hong Kong seller selling Kobe Patch. I am trying to reach a global set of buyers/fans.

## Getting Started

1. `npm install`

   This will install the necessary files

2. `cp .env.example .env.dev`

   This will create a environment variables file. Replace the Stripe related Envrionment Variables with your Stripe API Keys.

3. `npm run start-client`

   This will run the client side.
   Note that this is in development mode. The page will reload if any changes was made.<br />

4. `npm run start-server`

   This will run the server side.
   Note that this is in development mode. The server will reload if any changes was made. <br />

5. `ngrok http 3001` (optional) or use stripe-cli to create event

   To enable webhook, add the ngrok URL https://xxxxxxxx.ngrok.io/webhook/stripe in Stripe Dashboard - https://dashboard.stripe.com/test/webhooks

6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
