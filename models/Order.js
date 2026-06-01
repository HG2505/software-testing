'use strict';

const fs   = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'orders.json');

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8') || '[]');
  } catch (_) {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(dataFile, JSON.stringify(orders, null, 2));
}

class Order {
  static getAll() {
    return readOrders();
  }

  static getById(orderId) {
    return Order.getAll().find(o => o.id === String(orderId)) || null;
  }

  static getByUserId(userId) {
    return Order.getAll()
      .filter(o => String(o.userId) === String(userId))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  static add(order) {
    const orders = Order.getAll();
    const enriched = {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      status:    order.status    || 'confirmed',
    };
    orders.push(enriched);
    writeOrders(orders);
    return enriched;
  }

  static updateStatus(orderId, status) {
    const orders = Order.getAll();
    const idx = orders.findIndex(o => o.id === String(orderId));
    if (idx === -1) throw new Error('Order not found.');
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    writeOrders(orders);
    return orders[idx];
  }

  static count() {
    return Order.getAll().length;
  }

  static totalRevenue() {
    return +Order.getAll().reduce((s, o) => s + (o.total || 0), 0).toFixed(2);
  }
}

module.exports = Order;
