'use strict';

const Cart = require('../models/Cart');

const P1 = { id: 1, name: 'Backpack',  price: 29.99 };
const P2 = { id: 2, name: 'Bike Light', price: 9.99  };

describe('Cart – initial state', () => {
  test('starts empty', () => {
    const c = new Cart();
    expect(c.count).toBe(0);
    expect(c.subtotal).toBe(0);
    expect(c.lines).toEqual([]);
  });

  test('restores from session data', () => {
    const sessionData = { items: { '1': { product: P1, qty: 2 } } };
    const c = new Cart(sessionData);
    expect(c.count).toBe(2);
    expect(c.subtotal).toBe(59.98);
  });
});

describe('Cart.add()', () => {
  test('adds new product', () => {
    const c = new Cart();
    c.add(P1, 1);
    expect(c.count).toBe(1);
    expect(c.lines[0].qty).toBe(1);
  });

  test('increments qty for existing product', () => {
    const c = new Cart();
    c.add(P1, 2);
    c.add(P1, 3);
    expect(c.count).toBe(5);
    expect(c.lines).toHaveLength(1);
  });

  test('handles multiple different products', () => {
    const c = new Cart();
    c.add(P1);
    c.add(P2);
    expect(c.count).toBe(2);
    expect(c.lines).toHaveLength(2);
  });

  test('default quantity is 1', () => {
    const c = new Cart();
    c.add(P1);
    expect(c.lines[0].qty).toBe(1);
  });
});

describe('Cart.remove()', () => {
  test('removes an item by id', () => {
    const c = new Cart();
    c.add(P1); c.add(P2);
    c.remove(P1.id);
    expect(c.count).toBe(1);
    expect(c.lines[0].product.id).toBe(P2.id);
  });
  test('is safe when product not in cart', () => {
    const c = new Cart();
    c.add(P1);
    expect(() => c.remove(999)).not.toThrow();
    expect(c.count).toBe(1);
  });
});

describe('Cart.updateQty()', () => {
  test('updates quantity', () => {
    const c = new Cart();
    c.add(P1, 3);
    c.updateQty(P1.id, 1);
    expect(c.count).toBe(1);
  });
  test('removes item when qty set to 0', () => {
    const c = new Cart();
    c.add(P1, 2);
    c.updateQty(P1.id, 0);
    expect(c.count).toBe(0);
  });
  test('removes item when qty is negative', () => {
    const c = new Cart();
    c.add(P1);
    c.updateQty(P1.id, -1);
    expect(c.lines).toEqual([]);
  });
});

describe('Cart.clear()', () => {
  test('empties cart', () => {
    const c = new Cart();
    c.add(P1, 2); c.add(P2, 1);
    c.clear();
    expect(c.count).toBe(0);
    expect(c.lines).toEqual([]);
  });
});

describe('Cart totals', () => {
  test('subtotal, tax (8%), total are correct', () => {
    const c = new Cart();
    c.add(P1, 2); // 59.98
    c.add(P2, 1); // 9.99 → subtotal = 69.97
    expect(c.subtotal).toBeCloseTo(69.97, 2);
    expect(c.tax).toBeCloseTo(69.97 * 0.08, 2);
    expect(c.total).toBeCloseTo(69.97 * 1.08, 2);
  });

  test('subtotal line items are correct', () => {
    const c = new Cart();
    c.add(P1, 3);
    expect(c.lines[0].subtotal).toBeCloseTo(89.97, 2);
  });
});

describe('Cart.toJSON()', () => {
  test('serializes correctly for session storage', () => {
    const c = new Cart();
    c.add(P1, 2);
    const json = c.toJSON();
    expect(json).toHaveProperty('items');
    expect(json.items['1'].qty).toBe(2);
  });

  test('round-trips through session', () => {
    const c1 = new Cart();
    c1.add(P1, 3);
    const c2 = new Cart(c1.toJSON());
    expect(c2.count).toBe(3);
    expect(c2.subtotal).toBeCloseTo(c1.subtotal, 2);
  });
});
