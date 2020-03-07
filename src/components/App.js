import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ProductForm from './ProductForm';
import CheckoutForm from './CheckoutForm';
import 'whatwg-fetch';

import './App.css';

// const dotenv = require('dotenv');
// dotenv.config({ path: './../.env.dev' });
// const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripePublicKey = "pk_test_IiDh2KlTKugUyS9iAbXJc44O00NXgQZ9cR"

const stripePromise = loadStripe(stripePublicKey);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // TODO: hardcode the product we are displaying. we only have one product.
      selectedProductId: '248',
      // default to 1
      selectedQuantity: 1,
      // default to usd
      selectedCurrency: 'usd',
      product: {},
      // default to 1
      currencyAvailable: [],
      priceMap: [],
      paymentIntentClientSecret: null,

      step: 0,
    };
  }

  mapProductPriceByCurrency = product => {
    if ('prices' in product) {
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
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const product = await response.json();
      // get a list of currency this product supports.
      // a better way of doing this is to assume the store supports a fixed amount of
      // currency and we fetch all the currencies only once
      const priceMap = this.mapProductPriceByCurrency(product);
      console.log(priceMap);

      this.setState({
        product: product,
        currencyAvailable: Object.keys(priceMap),
        priceMap,
      });
    } catch (e) {
      throw e;
    }
  };

  handleQuantityChange = event => {
    this.setState({
      selectedQuantity: event.target.value,
    });
  };

  handleCurrencyChange = event => {
    this.setState({
      selectedCurrency: event.target.value,
    });
  };

  handlePayClick = async paymentMethod => {
    // create payment intent
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: this.state.selectedProductId,
        currency: this.state.selectedCurrency,
        quantity: this.state.selectedQuantity,
      }),
    });

    const data = await response.json();
    this.setState({
      step: 1,
      paymentIntentClientSecret: data.secret,
    });
  };

  handleSuccessPayment = () => {
    this.setState({
      step: 2,
      // default to 1
      selectedQuantity: 1,
      // default to usd
      selectedCurrency: 'usd',
      paymentIntentClientSecret: null,
    });
  };

  handleFailedPayment = () => {
    this.setState({
      step: 3,
      paymentIntentClientSecret: null,
    });
  };

  render() {
    return (
      <div className="Container">
        <div className="Header">
          <h1>Remembering Kobe 🐐</h1>
          <i>All proceed goes to the Mamba Sports Foundation</i>
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
              handleQuantityChange={this.handleQuantityChange}
              handleCurrencyChange={this.handleCurrencyChange}
              handlePayClick={this.handlePayClick}
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
                Total:{' '}
                {this.state.selectedQuantity *
                  this.state.priceMap[this.state.selectedCurrency]}
              </p>
              <CheckoutForm
                handleSuccessPayment={this.handleSuccessPayment}
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
        {this.state.step == 3 ? (
          <div className="Content">Fail</div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default App;
