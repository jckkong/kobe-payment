import React from "react";
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import "./App.css";

export default function CheckoutForm(props) {
  const [error, setError] = useState(null);
  // react hook to load stripe and elements logic
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async event => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmCardPayment(`${props.clientSecret}`, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.error(result.error.message);
      // Inform the user if there was an error.
      setError(result.error.message);
    } else {
      setError(null);
      // The payment has been processed!
      if (result.paymentIntent.status === "succeeded") {
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
        props.handleSuccessPayment();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="Card">
        <CardElement />
      </div>
      {error != null ? (
        <div className="errors" role="alert">
          {error}
        </div>
      ) : (
        <div></div>
      )}
      <p>
        <button disabled={!stripe}>Pay</button>
      </p>
    </form>
  );
}
