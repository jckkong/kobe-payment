const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: ".env.dev" });

const payment = require("./payment");
const product = require("./price.json");
const file = require("./file");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("API server up and running"));

app.get("/api/status", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ status: `working` }));
});

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
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).send(JSON.stringify({ error: e.message }));
  }
});

app.get("/api/product/:id", async (req, res) => {
  // currently we don't use productId as we only have one product.
  const productId = req.params.id;
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(product));
});

app.post("/webhook/stripe", async (req, res) => {
  // verify webhook signature is coming froms stripe
  const sig = req.headers["stripe-signature"];
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let event = req.body;

  // handle stripe webhook event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;

      try {
        // append the paymentIntent result into a log file
        await file.append(
          `${paymentIntent.created},${paymentIntent.id},${paymentIntent.status}`,
          process.env.LOG_PATH
        );

        res.status(200).send({ recieved: true });
      } catch (e) {
        console.error(e);
        // if we are unable to append a line to the file. send a 400 response so stripe retry
        res.status(400).send(`Webhook Error: Unable to append to log`);
      }
      break;

    default:
      // Return a 200 response to acknowledge receipt of the event
      res.status(200).send({ recieved: true });
  }
});

app.listen(process.env.API_PORT, () =>
  console.log(`Express server is running on localhost:${process.env.API_PORT}`)
);
