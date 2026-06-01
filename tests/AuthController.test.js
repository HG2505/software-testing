'use strict';

const fs      = require('fs');
const path    = require('path');
const Account = require('../models/Account');
const authCtrl = require('../controllers/authController');

const dataFile = path.join(__dirname, '..', 'data', 'accounts.json');
const backup   = path.join(__dirname, '..', 'data', 'accounts.json.bak');

function mockRes() {
  const res = {};
  res.render   = jest.fn(() => res);
  res.redirect = jest.fn(() => res);
  res.locals   = {};
  return res;
}

beforeAll(() => { if (fs.existsSync(dataFile)) fs.copyFileSync(dataFile, backup); });
afterAll(() => { if (fs.existsSync(backup)) { fs.copyFileSync(backup, dataFile); fs.unlinkSync(backup); } });
beforeEach(() => fs.writeFileSync(dataFile, '[]'));
afterEach (() => fs.writeFileSync(dataFile, '[]'));

describe('requireLogin', () => {
  test('redirects to /login when not authenticated', () => {
    const req = { session: {} };
    const res = mockRes();
    const next = jest.fn();
    authCtrl.requireLogin(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/login?error=1');
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when user is in session', () => {
    const req  = { session: { user: { id: 1 } } };
    const res  = mockRes();
    const next = jest.fn();
    authCtrl.requireLogin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('showLogin', () => {
  test('renders login with no error normally', () => {
    const req = { session: {}, query: {} };
    authCtrl.showLogin(req, mockRes());
    // just checks it doesn't throw
  });

  test('passes error message when ?error=1', () => {
    const req = { session: {}, query: { error: '1' } };
    const res = mockRes();
    authCtrl.showLogin(req, res);
    const args = res.render.mock.calls[0][1];
    expect(args.error).toMatch(/login/i);
  });

  test('passes success message when ?registered=1', () => {
    const req = { session: {}, query: { registered: '1' } };
    const res = mockRes();
    authCtrl.showLogin(req, res);
    expect(res.render.mock.calls[0][1].successMessage).toBeDefined();
  });
});

describe('login', () => {
  const CREDS = { name: 'Alice', email: 'alice@test.com', password: 'pass123', address: '1 St' };
  beforeEach(() => Account.add(CREDS));

  test('renders error when fields empty', () => {
    const req = { session: {}, body: { email: '', password: '' } };
    const res = mockRes();
    authCtrl.login(req, res);
    expect(res.render.mock.calls[0][1].error).toBeDefined();
  });

  test('renders error for invalid credentials', () => {
    const req = { session: {}, body: { email: CREDS.email, password: 'wrong' } };
    const res = mockRes();
    authCtrl.login(req, res);
    expect(res.render.mock.calls[0][1].error).toMatch(/invalid/i);
  });

  test('sets session.user and redirects on success (empty cart → /)', () => {
    const req = { session: {}, body: { email: CREDS.email, password: CREDS.password } };
    const res = mockRes();
    authCtrl.login(req, res);
    expect(req.session.user).toBeDefined();
    expect(req.session.user.email).toBe(CREDS.email);
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  test('redirects to /checkout when cart has items', () => {
    const req = {
      session: { cart: { items: { '1': { product: { id: 1, price: 10 }, qty: 1 } } } },
      body:    { email: CREDS.email, password: CREDS.password },
    };
    const res = mockRes();
    authCtrl.login(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/checkout');
  });
});

describe('logout', () => {
  test('removes user from session and redirects', () => {
    const req = { session: { user: { id: 1 } } };
    const res = mockRes();
    authCtrl.logout(req, res);
    expect(req.session.user).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});

describe('register', () => {
  test('renders error when fields missing', () => {
    const req = { session: {}, body: { name: '', email: '', password: '', address: '' } };
    const res = mockRes();
    authCtrl.register(req, res);
    expect(res.render.mock.calls[0][1].error).toBeDefined();
  });

  test('redirects to /login?registered=1 on success', () => {
    const req = {
      session: {},
      body: { name: 'Bob', email: 'bob@test.com', password: 'secure', address: '2 Ave' },
    };
    const res = mockRes();
    authCtrl.register(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/login?registered=1');
  });

  test('renders error when email already taken', () => {
    Account.add({ name: 'A', email: 'dup@test.com', password: 'p', address: 'a' });
    const req = {
      session: {},
      body: { name: 'B', email: 'dup@test.com', password: 'p', address: 'a' },
    };
    const res = mockRes();
    authCtrl.register(req, res);
    expect(res.render.mock.calls[0][1].error).toMatch(/registered/i);
  });
});
