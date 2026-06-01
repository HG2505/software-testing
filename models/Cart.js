'use strict';

class Cart {
  constructor(sessionCart = {}) {
    this.items = sessionCart.items || {};
  }

  add(product, qty = 1) {
    const id = String(product.id);
    if (this.items[id]) {
      this.items[id].qty += qty;
    } else {
      this.items[id] = { product, qty };
    }
  }

  remove(productId) {
    delete this.items[String(productId)];
  }

  updateQty(productId, qty) {
    const id = String(productId);
    if (qty <= 0) {
      this.remove(productId);
    } else if (this.items[id]) {
      this.items[id].qty = qty;
    }
  }

  clear() {
    this.items = {};
  }

  get lines() {
    return Object.values(this.items).map(({ product, qty }) => ({
      product,
      qty,
      subtotal: +(product.price * qty).toFixed(2),
    }));
  }

  get count() {
    return Object.values(this.items).reduce((s, i) => s + i.qty, 0);
  }

  get subtotal() {
    return +this.lines.reduce((s, l) => s + l.subtotal, 0).toFixed(2);
  }

  get tax() {
    return +(this.subtotal * 0.08).toFixed(2);
  }

  get total() {
    return +(this.subtotal + this.tax).toFixed(2);
  }

  toJSON() {
    return { items: this.items };
  }
}

module.exports = Cart;
