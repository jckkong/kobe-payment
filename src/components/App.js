import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProductForm from "./ProductForm";
import CheckoutForm from "./CheckoutForm";
import "whatwg-fetch";

import "./App.css";

const stripePublicKey = "pk_test_IiDh2KlTKugUyS9iAbXJc44O00NXgQZ9cR";
const stripePromise = loadStripe(stripePublicKey);

/*
 * App displays the Home page. It has 3 stages.
 * 1st stage - display the Product Information
 * 2nd stage - display the Checkout Page
 * 3rd stage - display the Success Page
 */
class App extends React.Component {
  constructor(props) {
    super(props);

    // initial state
    this.state = {
      // hardcode the product we are displaying. we only have one product.
      selectedProductId: "248",
      // default to 1
      selectedQuantity: 1,
      // default to usd
      selectedCurrency: "hkd",

      selectedPaymentMethod: null,

      product: {},
      currencyAvailable: [],
      priceMap: [],
      paymentIntentClientSecret: null,

      // default to the 1st stage which is the product info
      step: 0
    };
  }

  // fetch the necessary information on initial launch
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
      // get the price map of this product for faster lookup
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

  // format the price based on currency. truncates the price to 2 decimal places
  formatPrice = (amount, currency) => {
    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    });

    return formatter.format(amount / 100);
  };

  // creates a price map for the selectedProduct
  // priceMap[currency] = amount
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

  // set new quantity to state
  handleQuantityChange = event => {
    this.setState({
      selectedQuantity: event.target.value
    });
  };

  // set new currency to state
  handleCurrencyChange = event => {
    this.setState({
      selectedCurrency: event.target.value
    });
  };

  // set new payment method to state
  updatePaymentMethod = async selectedPaymentMethod => {
    if (selectedPaymentMethod !== this.state.selectedPaymentMethod) {
      this.setState({
        selectedPaymentMethod: selectedPaymentMethod
      });
    }
  };

  // update payment intent client secret when it is recieved from the server
  updatePaymentIntentClientSecret = async paymentIntentClientSecret => {
    if (paymentIntentClientSecret !== this.state.paymentIntentClientSecret) {
      this.setState({
        step: paymentIntentClientSecret === null ? 0 : 1,
        paymentIntentClientSecret: paymentIntentClientSecret
      });
    }
  };

  // proceed to next step = 2 after successful payment
  handleSuccessPayment = () => {
    this.setState({
      step: 2,
      // default back to 1
      selectedQuantity: 1,
      // default back to usd
      selectedCurrency: "usd",
      // reset paymentIntentClientSecret
      paymentIntentClientSecret: null,
      // reset selectedPaymentMethod
      selectedPaymentMethod: null
    });
  };

  render() {
    return (
      <div className="Container">
        <div className="Header">
          <h1>
            Remembering Kobe{" "}
            <span role="img" aria-label="Goat">
              🐐
            </span>
          </h1>
          <i>All proceeds goes to the Mamba Sports Foundation</i>
        </div>
        {this.state.step === 0 ? (
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
        {this.state.step === 1 ? (
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
        {this.state.step === 2 ? (
          <div className="Content">Success</div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default App;
