// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const dotenv = require("dotenv");
dotenv.config({ path: "../.env.dev" });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = require("stripe")(stripeSecretKey);

async function create(amount, currency, productId) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { productId: productId, integration_check: "accept_a_payment" }
    });

    const clientSecret = paymentIntent.client_secret;

    return clientSecret;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

module.exports = {
  create
};
