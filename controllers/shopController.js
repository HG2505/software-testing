'use strict';
const Product  = require('../models/Product');
const Category = require('../models/Category');
const Cart     = require('../models/Cart');
const Order    = require('../models/Order');

function getCart(req) {
  return new Cart(req.session.cart || {});
}
function saveCart(req, cart) {
  req.session.cart = cart.toJSON();
}

// GET /
exports.showShop = (req, res) => {
  const { category, type, sort } = req.query;
  let products = Product.getAll();

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (type && type !== 'all') {
    products = products.filter(p => p.type === type);
  }
  if (sort === 'price-asc')  products.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'name')       products.sort((a, b) => a.name.localeCompare(b.name));

  const cart = getCart(req);
  res.render('shop', {
    products,
    categories: Category.getAll(),
    types:      Product.getTypes(),
    activeCategory: category || 'all',
    activeType:     type     || 'all',
    activeSort:     sort     || 'default',
    cartCount:      cart.count,
  });
};

// POST /cart/add
exports.addToCart = (req, res) => {
  const product = Product.getById(req.body.productId);
  if (!product) return res.status(404).send('Product not found');
  const cart = getCart(req);
  cart.add(product, 1);
  saveCart(req, cart);
  // redirect về trang trước, fallback về '/'
  const referer = req.headers.referer || '/';
  res.redirect(referer);
};

// GET /cart
exports.showCart = (req, res) => {
  const cart = getCart(req);
  res.render('cart', {
    lines:     cart.lines,
    subtotal:  cart.subtotal,
    tax:       cart.tax,
    total:     cart.total,
    cartCount: cart.count,
    empty:     cart.count === 0,
  });
};

// POST /cart/update
exports.updateCart = (req, res) => {
  const { productId, qty } = req.body;
  const cart = getCart(req);
  cart.updateQty(productId, Number(qty));
  saveCart(req, cart);
  res.redirect('/cart');
};

// POST /cart/remove
exports.removeFromCart = (req, res) => {
  const cart = getCart(req);
  cart.remove(req.body.productId);
  saveCart(req, cart);
  res.redirect('/cart');
};

// POST /cart/clear
exports.clearCart = (req, res) => {
  const cart = getCart(req);
  cart.clear();
  saveCart(req, cart);
  res.redirect('/cart');
};

// GET /checkout
exports.showCheckout = (req, res) => {
  const cart = getCart(req);
  if (cart.count === 0) return res.redirect('/cart');
  const user = req.session.user || {};
  res.render('checkout', {
    lines:     cart.lines,
    subtotal:  cart.subtotal,
    tax:       cart.tax,
    total:     cart.total,
    cartCount: cart.count,
    name:      user.name || '',
    email:     user.email || '',
    address:   user.address || '',
  });
};

exports.showOrderHistory = (req, res) => {
  const cart = getCart(req);
  const userId = req.session.user?.id;
  const orders = Order.getByUserId(userId);
  res.render('order-history', {
    orders,
    cartCount: cart.count,
  });
};

// POST /checkout
exports.placeOrder = (req, res) => {
  const cart = getCart(req);
  if (cart.count === 0) return res.redirect('/cart');
  const user = req.session.user || {};
  const order = {
    id:       'ORD-' + Date.now(),
    userId:   user.id,
    email:    user.email,
    items:    cart.lines,
    total:    cart.total,
    name:     req.body.name,
    address:  req.body.address,
    placedAt: new Date().toLocaleString('vi-VN'),
  };
  Order.add(order);
  cart.clear();
  saveCart(req, cart);
  res.render('order-complete', { order, cartCount: 0 });
};
