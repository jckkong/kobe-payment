const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: ".env.dev" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const payment = require("./payment");
const product = require("./price.json");
const file = require("./file");

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // for webhook/stripe, we need the raw body to validate
  // webhook sigature. hence skip express.json()
  if (req.originalUrl === "/webhook/stripe") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get("/", (req, res) => res.send("API server up and running"));

// get api server status
app.get("/api/status", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ status: `working` }));
});

// create a payment intent on Stripe
app.post("/api/payment/create", async (req, res) => {
  const productId = req.body.productId;
  const currency = req.body.currency;

  try {
    // get amount from our database
    const amount = product.prices.find(price => {
      return price.currency == currency;
    }).amount;
    const total = req.body.quantity * amount;
    const clientSecret = await payment.create(total, currency, productId);

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ secret: clientSecret }));
  } catch (err) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).send(JSON.stringify({ error: err.message }));
  }
});

// get product pricing
app.get("/api/product/:id", async (req, res) => {
  // currently we don't use productId as we only have one product.
  const productId = req.params.id;
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(product));
});

// handle stripe webook request
app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // verify webhook signature is coming from stripe
    const sig = req.headers["stripe-signature"];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }

    let event = req.body;

    // handle stripe webhook event
    switch (event.type) {
      case "payment_intent.succeeded":
        try {
          const paymentIntent = event.data.object;

          // append the paymentIntent result into a log file
          await file.append(
            `${paymentIntent.created},${paymentIntent.id},${paymentIntent.status}`,
            process.env.LOG_PATH
          );

          res.status(200).send({ recieved: true });
        } catch (err) {
          console.error(err);
          // if we are unable to append a line to the file,
          // send a 400 response so stripe can retry sending the webook
          res.status(400).send(`Webhook Error: Unable to append to log`);
        }
        break;

      default:
        // Return a 200 response to acknowledge receipt of the event
        res.status(200).send({ recieved: true });
    }
  }
);

app.listen(process.env.API_PORT, () =>
  console.log(`Express server is running on localhost:${process.env.API_PORT}`)
);
