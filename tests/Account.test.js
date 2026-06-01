'use strict';

const fs      = require('fs');
const path    = require('path');
const Account = require('../models/Account');

const dataFile = path.join(__dirname, '..', 'data', 'accounts.json');
const backup   = path.join(__dirname, '..', 'data', 'accounts.json.bak');

const SAMPLE = {
  name: 'Test User', email: 'test@example.com',
  password: 'Secret123!', address: '123 Test St, HCMC',
};

beforeAll(() => {
  if (fs.existsSync(dataFile)) fs.copyFileSync(dataFile, backup);
});
afterAll(() => {
  if (fs.existsSync(backup)) { fs.copyFileSync(backup, dataFile); fs.unlinkSync(backup); }
});
beforeEach(() => fs.writeFileSync(dataFile, '[]'));
afterEach (() => fs.writeFileSync(dataFile, '[]'));

// ── getAll / findByEmail / findById ──────────────────────────
describe('Account.getAll()', () => {
  test('returns empty array initially', () => {
    expect(Account.getAll()).toEqual([]);
  });
  test('returns array type always', () => {
    expect(Array.isArray(Account.getAll())).toBe(true);
  });
});

describe('Account.findByEmail()', () => {
  test('returns undefined when account not found', () => {
    expect(Account.findByEmail('ghost@x.com')).toBeUndefined();
  });
  test('finds account case-insensitively', () => {
    Account.add(SAMPLE);
    expect(Account.findByEmail('TEST@EXAMPLE.COM')).toBeDefined();
  });
});

describe('Account.findById()', () => {
  test('finds account by numeric or string id', () => {
    const created = Account.add(SAMPLE);
    expect(Account.findById(created.id)).toBeDefined();
    expect(Account.findById(String(created.id))).toBeDefined();
  });
  test('returns undefined for unknown id', () => {
    expect(Account.findById(99999)).toBeUndefined();
  });
});

// ── add ──────────────────────────────────────────────────────
describe('Account.add()', () => {
  test('creates account with correct fields', () => {
    const acc = Account.add(SAMPLE);
    expect(acc).toMatchObject({ name: 'Test User', email: 'test@example.com', role: 'customer' });
    expect(acc.passwordHash).toBeDefined();
    expect(acc.id).toBeDefined();
    expect(acc.createdAt).toBeDefined();
  });

  test('password is hashed (not stored in plain text)', () => {
    const acc = Account.add(SAMPLE);
    expect(acc.passwordHash).not.toBe(SAMPLE.password);
  });

  test('throws when email already registered', () => {
    Account.add(SAMPLE);
    expect(() => Account.add(SAMPLE)).toThrow('Email already registered.');
  });

  test('throws when required fields missing', () => {
    expect(() => Account.add({ name: '', email: '', password: '', address: '' })).toThrow('All fields are required.');
  });

  test('normalizes email to lowercase', () => {
    const acc = Account.add({ ...SAMPLE, email: 'UPPER@CASE.COM' });
    expect(acc.email).toBe('upper@case.com');
  });

  test('preserves existing accounts when adding new one', () => {
    Account.add(SAMPLE);
    Account.add({ ...SAMPLE, email: 'second@example.com' });
    expect(Account.getAll()).toHaveLength(2);
  });
});

// ── authenticate ─────────────────────────────────────────────
describe('Account.authenticate()', () => {
  beforeEach(() => Account.add(SAMPLE));

  test('returns user for valid credentials', () => {
    const user = Account.authenticate(SAMPLE.email, SAMPLE.password);
    expect(user).toBeDefined();
    expect(user.email).toBe(SAMPLE.email);
  });

  test('returns null for wrong password', () => {
    expect(Account.authenticate(SAMPLE.email, 'wrong')).toBeNull();
  });

  test('returns null for unknown email', () => {
    expect(Account.authenticate('nobody@example.com', 'anything')).toBeNull();
  });

  test('is case-insensitive on email', () => {
    expect(Account.authenticate('TEST@EXAMPLE.COM', SAMPLE.password)).toBeDefined();
  });
});

// ── update ───────────────────────────────────────────────────
describe('Account.update()', () => {
  test('updates account fields', () => {
    const acc = Account.add(SAMPLE);
    const updated = Account.update(acc.id, { address: 'New Address 456' });
    expect(updated.address).toBe('New Address 456');
    expect(updated.updatedAt).toBeDefined();
  });

  test('throws for unknown id', () => {
    expect(() => Account.update(99999, {})).toThrow('Account not found.');
  });
});
