import React from "react";
import { useState } from "react";
import "./App.css";

export default function ProductForm(props) {
  const [error, setError] = useState(null);

  const createQuantityOptions = (min, max) => {
    let options = [];
    for (let i = min; i < max; i++) {
      options.push(<option selected={i == props.selectedQuantity}>{i}</option>);
    }
    return options;
  };

  const handlePayClick = async paymentMethod => {
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
        paymentMethod: paymentMethod
      })
    });

    if (response.ok) {
      const data = await response.json();
      setError(null);
      props.updatePaymentIntentClientSecret(data.secret);
    } else {
      const data = await response.json();
      setError(data.error);
      props.updatePaymentIntentClientSecret(null);
    }
  };

  return (
    <div>
      <p>
        {props.product.product_name || ""} -{" "}
        {props.priceMap[props.selectedCurrency]}
      </p>
      <img src="patch.jpeg" width="200px" />
      <p>Free Shipping 🌎</p>
      <p>
        Currency:
        <select onChange={props.handleCurrencyChange}>
          {props.currencyAvailable.map(value => {
            return (
              <option selected={value === props.selectedCurrency} key={value}>
                {value}
              </option>
            );
          })}
        </select>
      </p>

      <p>
        Quantity:
        <select onChange={props.handleQuantityChange}>
          {createQuantityOptions(1, 10)}
        </select>
      </p>
      <div className="PriceBox">
        <p>
          Pay {props.selectedQuantity * props.priceMap[props.selectedCurrency]}{" "}
        </p>
        <p>
          with
          <button onClick={() => handlePayClick("card")}>card</button>
          <button onClick={() => handlePayClick("wechat")}>wechat</button>
          <button onClick={() => handlePayClick("alipay")}>alipay</button>
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
