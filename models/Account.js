'use strict';

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

const dataFile = path.join(__dirname, '..', 'data', 'accounts.json');

function readAccounts() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const accounts = raw ? JSON.parse(raw) : [];
    return Array.isArray(accounts) ? accounts : [];
  } catch (_) {
    return [];
  }
}

function writeAccounts(accounts) {
  const normalized = Array.isArray(accounts) ? accounts : [accounts];
  fs.writeFileSync(dataFile, JSON.stringify(normalized, null, 2));
}

class Account {
  static getAll() {
    return readAccounts();
  }

  static findByEmail(email) {
    return Account.getAll().find(a => a.email === String(email).trim().toLowerCase());
  }

  static findById(id) {
    return Account.getAll().find(a => String(a.id) === String(id));
  }

  static hashPassword(password) {
    return bcrypt.hashSync(String(password), 10);
  }

  static verifyPassword(password, hash) {
    // support old sha256 hashes (hex, 64 chars) for backward compat
    if (/^[a-f0-9]{64}$/.test(hash)) {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(String(password)).digest('hex') === hash;
    }
    return bcrypt.compareSync(String(password), hash);
  }

  static authenticate(email, password) {
    const user = Account.findByEmail(email);
    if (!user) return null;
    return Account.verifyPassword(password, user.passwordHash) ? user : null;
  }

  static add({ name, email, password, address }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!name || !normalizedEmail || !password || !address) {
      throw new Error('All fields are required.');
    }
    if (Account.findByEmail(normalizedEmail)) {
      throw new Error('Email already registered.');
    }

    const accounts  = Account.getAll();
    const newAccount = {
      id:           Date.now(),
      name:         String(name).trim(),
      email:        normalizedEmail,
      address:      String(address).trim(),
      passwordHash: Account.hashPassword(password),
      role:         'customer',
      createdAt:    new Date().toISOString(),
    };
    accounts.push(newAccount);
    writeAccounts(accounts);
    return newAccount;
  }

  static update(id, fields) {
    const accounts = Account.getAll();
    const idx = accounts.findIndex(a => String(a.id) === String(id));
    if (idx === -1) throw new Error('Account not found.');
    accounts[idx] = { ...accounts[idx], ...fields, updatedAt: new Date().toISOString() };
    writeAccounts(accounts);
    return accounts[idx];
  }
}

module.exports = Account;
