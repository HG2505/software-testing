'use strict';

const categories = require('../data/categories.json');

class Category {
  static getAll() {
    return categories;
  }
}

module.exports = Category;
