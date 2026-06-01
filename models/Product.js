'use strict';

const products = require('../data/products.json');
const types = require('../data/types.json');
const Category = require('./Category');

class Product {
  static getAll()      { return products; }
  static getById(id)   { return products.find(p => p.id === Number(id)); }
  static getCategories() {
    return Category.getAll();
  }
  static getTypes() {
    return types;
  }
}

module.exports = Product;
