'use strict';

const Category = require('../models/Category');

describe('Category model', () => {
  test('getAll returns all categories from JSON', () => {
    const categories = Category.getAll();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThanOrEqual(1);
    expect(categories).toEqual(expect.arrayContaining(['Accessories', 'Outdoor', 'Apparel']));
  });
});
