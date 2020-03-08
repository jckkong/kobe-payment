const dotenv = require("dotenv");
dotenv.config({ path: "../.env.dev" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create payment intent from stripe
async function create(amount, currency, productId) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { productId: productId }
    });

    // return back the clientSecret to client
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
