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
import { repeat } from 'lit-html/lib/repeat.js';
import { buttonStyle } from '../components/button-style.js';
import '../components/image.js';

import { store } from '../store/store.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

class ShopHome extends connect(store)(PageViewElement) {
  _render({ _categories }) {
    return html`
    ${buttonStyle}
    <style>

      .image-link {
        outline: none;
      }

      .image-link > shop-image::after {
        display: block;
        content: '';
        position: absolute;
        transition-property: opacity;
        transition-duration: 0s;
        transition-delay: 90ms;
        pointer-events: none;
        opacity: 0;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        outline: #2196F3 auto 5px;
        outline: -moz-mac-focusring auto 5px;
        outline: -webkit-focus-ring-color auto 5px;
      }

      .image-link:focus > shop-image::after {
        opacity: 1;
      }

      .item {
        display: block;
        text-decoration: none;
        text-align: center;
        margin-bottom: 40px;
      }

      .item:nth-of-type(3),
      .item:nth-of-type(4) {
        display: inline-block;
        width: 50%;
      }

      shop-image {
        position: relative;
        height: 320px;
        overflow: hidden;
      }

      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }

      .item:nth-of-type(3) > h2,
      .item:nth-of-type(4) > h2 {
        font-size: 1.1em;
      }

      shop-button {
        text-transform: capitalize;
      }

      @media (max-width: 767px) {
        shop-image {
          height: 240px;
        }

        h2 {
          margin: 24px 0;
        }

        .item:nth-of-type(3) > shop-button > a,
        .item:nth-of-type(4) > shop-button > a {
          padding: 8px 24px;
        }
      }

    </style>

    ${repeat(Object.keys(_categories), key => {
      const category = _categories[key];
      return html`<div class="item">
        <a class="image-link" href="/list/${category.name}">
          <shop-image src="${category.image}" alt="${category.title}" placeholder="${category.placeholder}"></shop-image>
        </a>
        <shop-button>
          <a aria-label$="${category.title}" href="/list/${category.name}">${category.title}</a>
        </shop-button>
      </div>`;
    })}
`;
  }

  static get properties() { return {

    _categories: Object

  }}

  _stateChanged(state) {
    this._categories = state.categories;
  }
}

customElements.define('shop-home', ShopHome);
