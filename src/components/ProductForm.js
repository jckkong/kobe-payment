import React from "react";
import { useState } from "react";
import "./App.css";

/*
 * ProductForm displays the Product Title, Image, Price and Total.
 * It allows the user to change the Quantity and the Currency.
 */
export default function ProductForm(props) {
  const [error, setError] = useState(null);

  // populate the select options tag for quantity
  const createQuantityOptions = (min, max) => {
    let options = [];
    for (let i = min; i < max; i++) {
      options.push(<option key={i}>{i}</option>);
    }
    return options;
  };

  // handle the pay button click
  // this will call api/payment/create to create PaymentIntent
  const handlePayClick = async selectedPaymentMethod => {
    // create payment intent
    const response = await fetch("/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: props.selectedProductId,
        currency: props.selectedCurrency,
        quantity: props.selectedQuantity,
        paymentMethod: selectedPaymentMethod,
        idempotencyKey: props.userSession
      })
    });

    if (response.ok) {
      const data = await response.json();
      setError(null);
      props.updatePaymentIntentClientSecret(data.secret);
      props.updatePaymentMethod(selectedPaymentMethod);
    } else {
      // if payment intent creation failed
      // display the error message from the server
      // reset the paymentIntentClientSecret
      const data = await response.json();
      setError(data.error);
      props.updatePaymentIntentClientSecret(null);
    }
  };

  return (
    <div>
      <p>
        {props.product.product_name || ""} -{" "}
        {props.formatPrice(
          props.priceMap[props.selectedCurrency],
          props.selectedCurrency
        )}
      </p>
      <img alt="kobe patch" src="patch.jpeg" width="200px" />
      <p>
        Free Shipping{" "}
        <span role="img" aria-label="Earth">
          🌎
        </span>
      </p>
      <p>
        Currency:
        <select
          value={props.selectedCurrency}
          onChange={props.handleCurrencyChange}
        >
          {props.currencyAvailable.map(value => {
            return (
              <option key={value} value={value}>
                {value}
              </option>
            );
          })}
        </select>
      </p>

      <p>
        Quantity:
        <select
          onChange={props.handleQuantityChange}
          value={props.selectedQuantity}
        >
          {createQuantityOptions(1, 10)}
        </select>
      </p>
      <div className="PriceBox">
        <p>
          Pay{" "}
          {props.formatPrice(
            props.selectedQuantity * props.priceMap[props.selectedCurrency],
            props.selectedCurrency
          )}
        </p>
        <p>
          with
          <button onClick={() => handlePayClick("card")}>card</button>
        </p>
      </div>
      {error != null ? (
        <div className="errors" role="alert">
          {error}
        </div>
      ) : (
        <div></div>
      )}
      <p></p>
    </div>
  );
}
