/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PageViewElement } from '../components/page-view-element.js';
import { html } from '@polymer/lit-element';
import { repeat } from 'lit-html/lib/repeat';
import { buttonStyle } from '../components/button-style.js';
import { checkboxStyle } from '../components/checkbox-style.js';
import { commonStyle } from '../components/common-style.js';
import { formStyle } from '../components/form-style.js';
import { inputStyle } from '../components/input-style.js';
import { selectStyle } from '../components/select-style.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';

import { store } from '../store/store.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { totalSelector } from '../store/reducers/cart.js';
import { updateCheckoutState } from '../store/actions/checkout.js';
import { clearCart } from '../store/actions/cart.js';
import { announceLabel } from '../store/actions/app.js';
import checkout from '../store/reducers/checkout.js';

store.addReducers({
  checkout
});

class ShopCheckout extends connect(store)(PageViewElement) {
  _render({ _cart, _response, _state, _total, _waiting, _hasBillingAddress }) {
    const cartList = _cart ? Object.keys(_cart).map(key => _cart[key]) : [];

    return html`
    ${buttonStyle}
    ${checkboxStyle}
    ${commonStyle}
    ${formStyle}
    ${inputStyle}
    ${selectStyle}
    <style>

      .main-frame {
        transition: opacity 0.5s;
      }

      .main-frame.waiting {
        opacity: 0.1;
      }

      shop-input, shop-select {
        font-size: 16px;
      }

      shop-select {
        margin-bottom: 20px;
      }

      paper-spinner-lite {
        position: fixed;
        top: calc(50% - 14px);
        left: calc(50% - 14px);
      }

      .billing-address-picker {
        margin: 28px 0;
        height: 20px;
        display: flex;
      }

      .billing-address-picker > label {
        margin-left: 12px;
      }

      .grid {
        margin-top: 40px;
        display: flex;
      }

      .grid > section {
        flex: 1;
      }

      .grid > section:not(:first-child) {
        margin-left: 80px;
      }

      .row {
        display: flex;
        align-items: flex-end;
      }

      .column {
        display: flex;
        flex-direction: column;
      }

      .row > .flex,
      .input-row > * {
        flex: 1;
      }

      .input-row > *:not(:first-child) {
        margin-left: 8px;
      }

      .shop-select-label {
        line-height: 20px;
      }

      .order-summary-row {
        line-height: 24px;
      }

      .total-row {
        font-weight: 500;
        margin: 30px 0;
      }

      #loginForm {
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
      }

      shop-button {
        margin: 5px 0;
      }

      #reset-password-link {
        margin: 5px 0 10px;
        font-size: 10px;
      }

      @media (max-width: 767px) {

        .grid {
          display: block;
          margin-top: 0;
        }

        .grid > section:not(:first-child) {
          margin-left: 0;
        }

      }

    </style>

    <div class$="${_waiting ? 'main-frame waiting' : 'main-frame'}">
      <div>User Account Settings</div>
      <form class="form" id="loginForm">
        <shop-input>
          <input type="email" id="email" name="email" placeholder="Your email" required
              aria-labelledby="emailLabel emailHeading">
          <shop-md-decorator error-message="Invalid Email" aria-hidden="true">
            <label id="emailLabel">Email</label>
            <shop-underline></shop-underline>
          </shop-md-decorator>
        </shop-input>
        <shop-input>
          <input type="password" id="password" name="password" placeholder="Your password" required
              aria-labelledby="emailLabel emailHeading">
          <shop-md-decorator error-message="Invalid Password" aria-hidden="true">
            <label id="passwordLabel">Password</label>
            <shop-underline></shop-underline>
          </shop-md-decorator>
        </shop-input>
        <a id="reset-password-link" on-click="${e => this._sendPasswordReset()}">Reset Password</a>
        <shop-button id="login-button">
          <input type="button" on-click="${e => this._signin()}" value="Sign In">
        </shop-button>
        <shop-button id="signup-button">
          <input type="button" on-click="${e => this._signup()}" value="Sign Up">
        </shop-button>
      </form>
    </div>

    <!-- Show spinner when waiting for the server to repond -->
    <paper-spinner-lite active="${_waiting}"></paper-spinner-lite>
    `;
  }

  static get properties() { return {

    /**
     * The total price of the contents in the user's cart.
     */
    _total: Number,

    /**
     * The state of the form. Valid values are:
     * `init`, `success` and `error`.
     */
    _state: String,

    /**
     * The cart contents.
     */
    _cart: Object,

    /**
     * The server's response.
     */
    _response: Object,

    /**
     * If true, the user must enter a billing address.
     */
    _hasBillingAddress: Boolean,

    /**
     * True when waiting for the server to repond.
     */
    _waiting: Boolean

  }}

  _getFormData(form) {
    return {
      email: form.children[0].children[0].value,
      password: form.children[1].children[0].value
    };
  }

  _stateChanged(state) {
    this._cart = state.cart;
    this._total = totalSelector(state);
    this._state = state.checkout.state;
  }

  _signin() {
    const checkoutForm = this.shadowRoot.querySelector('#loginForm');
    if (this._validateForm(checkoutForm)) {
      const { email, password } = _getFormData(checkoutForm);
      this._sendLoginRequest(email, password)
        .then(res => res.json())
        .then(data => this._didReceiveResponse(data))
        .catch(_ => this._didReceiveResponse({
          error: 1,
          errorMessage: _.code + '' + _.message
        }));
    }
  }

  _signup() {
    const checkoutForm = this.shadowRoot.querySelector('#loginForm');
    if (this._validateForm(checkoutForm)) {
      const { email, password } = _getFormData(checkoutForm);
      this._sendSignupRequest(email, password)
        .then(res => res.json())
        .then(data => this._didReceiveResponse(data))
        .catch(_ => this._didReceiveResponse({
          error: 1,
          errorMessage: _.code + '' + _.message
        }));
    }
    this.__sendEmailVerification();
  }

  /**
   * Validates the form's inputs and adds the `aria-invalid` attribute to the inputs
   * that don't match the pattern specified in the markup.
   */
  _validateForm(form) {
    let firstInvalid = false;

    for (let el, i = 0; el = form.elements[i], i < form.elements.length; i++) {
      if (el.checkValidity()) {
        el.removeAttribute('aria-invalid');
      } else {
        if (!firstInvalid) {
          if (el.nextElementSibling) {
            store.dispatch(announceLabel(el.nextElementSibling.getAttribute('error-message')));
          }
          if (el.scrollIntoViewIfNeeded) {
            el.scrollIntoViewIfNeeded();
          } else {
            el.scrollIntoView(false);
          }
          el.focus();
          firstInvalid = true;
        }
        el.setAttribute('aria-invalid', 'true');
      }
    }
    return !firstInvalid;
  }

  _sendSignupRequest(email, password) {
    this._waiting = true;

    return firebase.auth()
      .createUserWithEmailAndPassword(email, password).catch((error) => {
        if (errorCode == 'auth/weak-password') {
          console.log('password to weak');
        }
        console.log(error);
      });
    }

  _sendLoginRequest(email, password) {
    this._waiting = true;

    return firebase.auth()
    .signInWithEmailAndPassword(email, password).catch(function(error) {
      if (errorCode === 'auth/wrong-password') {
        console.log('password incorrect');
      }
      console.log(error);
    });
  }

  _sendEmailVerification() {
    firebase.auth().currentUser.sendEmailVerification().then(function() {
        alert('Email Verification Sent!');
      });
    }

  _sendPasswordReset() {
    const checkoutForm = this.shadowRoot.querySelector('#loginForm');
    const form = {
      ...checkoutForm,
      elements: [ checkoutForm.elements[0] ],
    };
    if (this._validateForm(form)) {
      const { email } = _getFormData(checkoutForm);
      firebase.auth().sendPasswordResetEmail(email).then(function() {
        alert('Password Reset Email Sent!');
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/invalid-email') {
          alert(errorMessage);
        } else if (errorCode == 'auth/user-not-found') {
          alert(errorMessage);
        }
        console.log(error);
      });
    }
  }

  /**
   * Handles the response from the server by checking the response status
   * and transitioning to the success or error UI.
   */
  _didReceiveResponse(response) {
    this._response = response;
    this._waiting = false;

    if (response.success) {
      store.dispatch(updateSignupState('success'));
    } else {
      store.dispatch(updateSignupState('error'));
    }
  }

}

customElements.define('user-account', ShopCheckout);
