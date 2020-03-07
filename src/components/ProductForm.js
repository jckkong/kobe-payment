import React from 'react';
import './App.css';

class ProductForm extends React.Component {
  constructor(props) {
    super(props);
  }

  createQuantityOptions = (min, max) => {
    let options = [];
    for (let i = min; i < max; i++) {
      options.push(
        <option selected={i == this.props.selectedQuantity}>{i}</option>
      );
    }
    return options;
  };

  render() {
    return (
      <div>
        <p>
          {this.props.product.product_name || ''} -{' '}
          {this.props.priceMap[this.props.selectedCurrency]}
        </p>
        <img src="patch.jpeg" width="200px" />
        <p>Free Shipping 🌎</p>
        <p>
          Currency:
          <select onChange={this.props.handleCurrencyChange}>
            {this.props.currencyAvailable.map(value => {
              return (
                <option
                  selected={value === this.props.selectedCurrency}
                  key={value}
                >
                  {value}
                </option>
              );
            })}
          </select>
        </p>

        <p>
          Quantity:
          <select onChange={this.props.handleQuantityChange}>
            {this.createQuantityOptions(1, 10)}
          </select>
        </p>
        <p>
          Pay{' '}
          {this.props.selectedQuantity *
            this.props.priceMap[this.props.selectedCurrency]}{' '}
        </p>
        <p>
          with
          <button onClick={() => this.props.handlePayClick('card')}>
            card
          </button>
          <button onClick={() => this.props.handlePayClick('wechat')}>
            wechat
          </button>
          <button onClick={() => this.props.handlePayClick('alipay')}>
            alipay
          </button>
        </p>
      </div>
    );
  }
}

export default ProductForm;
