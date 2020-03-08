import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProductForm from "./ProductForm";
import CheckoutForm from "./CheckoutForm";
import "whatwg-fetch";

import "./App.css";

const stripePublicKey = "pk_test_IiDh2KlTKugUyS9iAbXJc44O00NXgQZ9cR";

const stripePromise = loadStripe(stripePublicKey);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // hardcode the product we are displaying. we only have one product.
      selectedProductId: "248",
      // default to 1
      selectedQuantity: 1,
      // default to usd
      selectedCurrency: "hkd",
      selectedPaymentMethod: null,
      product: {},
      // default to 1
      currencyAvailable: [],
      priceMap: [],
      paymentIntentClientSecret: null,

      step: 0
    };
  }

  formatPrice = (amount, currency) => {
    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    });

    return formatter.format(amount / 100);
  };

  mapProductPriceByCurrency = product => {
    if ("prices" in product) {
      let priceMap = {};
      product.prices.forEach((value, index) => {
        const currency = product.prices[index].currency;
        const amount = product.prices[index].amount;
        priceMap[currency] = amount;
      });
      return priceMap;
    } else {
      return {};
    }
  };

  componentWillMount = async () => {
    try {
      // get the product to be displayed
      const response = await fetch(
        `/api/product/${this.state.selectedProductId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const product = await response.json();
      // get a list of currency this product supports.
      // a better way of doing this is to assume the store supports a fixed amount of
      // currency and we fetch all the currencies only once
      const priceMap = this.mapProductPriceByCurrency(product);

      this.setState({
        product: product,
        currencyAvailable: Object.keys(priceMap),
        priceMap
      });
    } catch (e) {
      throw e;
    }
  };

  handleQuantityChange = event => {
    this.setState({
      selectedQuantity: event.target.value
    });
  };

  handleCurrencyChange = event => {
    this.setState({
      selectedCurrency: event.target.value
    });
  };

  updatePaymentMethod = async selectedPaymentMethod => {
    if (selectedPaymentMethod != this.state.selectedPaymentMethod) {
      this.setState({
        selectedPaymentMethod: selectedPaymentMethod
      });
    }
  };

  updatePaymentIntentClientSecret = async paymentIntentClientSecret => {
    if (paymentIntentClientSecret != this.state.paymentIntentClientSecret) {
      this.setState({
        step: paymentIntentClientSecret == null ? 0 : 1,
        paymentIntentClientSecret: paymentIntentClientSecret
      });
    }
  };

  handleSuccessPayment = () => {
    this.setState({
      step: 2,
      // default to 1
      selectedQuantity: 1,
      // default to usd
      selectedCurrency: "usd",
      paymentIntentClientSecret: null
    });
  };

  render() {
    return (
      <div className="Container">
        <div className="Header">
          <h1>Remembering Kobe 🐐</h1>
          <i>All proceeds goes to the Mamba Sports Foundation</i>
        </div>
        {this.state.step == 0 ? (
          <div className="Content">
            <ProductForm
              product={this.state.product}
              priceMap={this.state.priceMap}
              currencyAvailable={this.state.currencyAvailable}
              selectedProductId={this.state.productId}
              selectedCurrency={this.state.selectedCurrency}
              selectedQuantity={this.state.selectedQuantity}
              formatPrice={this.formatPrice}
              handleQuantityChange={this.handleQuantityChange}
              handleCurrencyChange={this.handleCurrencyChange}
              updatePaymentIntentClientSecret={
                this.updatePaymentIntentClientSecret
              }
              updatePaymentMethod={this.updatePaymentMethod}
            ></ProductForm>
          </div>
        ) : (
          <div></div>
        )}
        {this.state.step == 1 ? (
          <div className="Content">
            <Elements stripe={stripePromise}>
              <p>Quantity: {this.state.selectedQuantity}</p>
              <p>
                Total:{" "}
                {this.formatPrice(
                  this.state.selectedQuantity *
                    this.state.priceMap[this.state.selectedCurrency],
                  this.state.selectedCurrency
                )}
              </p>
              <CheckoutForm
                handleSuccessPayment={this.handleSuccessPayment}
                selectedPaymentMethod={this.state.selectedPaymentMethod}
                clientSecret={this.state.paymentIntentClientSecret}
              />
            </Elements>
          </div>
        ) : (
          <div></div>
        )}
        {this.state.step == 2 ? (
          <div className="Content">Success</div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default App;
