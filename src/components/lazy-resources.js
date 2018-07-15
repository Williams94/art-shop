/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// shop-app
import "./icons.js";
import "./analytics.js";
import "./cart/cart-button.js";
import "./user-account-button.js";
import "./cart/cart-modal.js";
import "./snackbar.js";
import "./tabs/tabs.js";
import "./tabs/tab.js";
import "@polymer/paper-icon-button";
import "@polymer/app-layout/app-drawer/app-drawer.js";

// shop-list
// shop-detail
import "./warnings/network-warning.js";
import "./warnings/404.js";

// cart
import "./cart/cart-item.js";

// shop-checkout
import "@polymer/paper-spinner/paper-spinner-lite.js";

import { store } from '../store/store.js';
import { installCart } from '../store/cart.js';
import cart from '../store/reducers/cart.js';

store.addReducers({
  cart
});
installCart(store);
