const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const { signToken } = require('../src/utils/token');

async function createUser(overrides = {}) {
  const user = await User.create({
    name: 'Test User',
    email: `user${Date.now()}${Math.random()}@test.dev`,
    password: 'secret123',
    ...overrides,
  });
  return { user, token: signToken(user) };
}

function createProduct(overrides = {}) {
  return Product.create({
    name: 'Sample Product',
    description: 'A product used in tests',
    price: 10,
    category: 'misc',
    stock: 5,
    ...overrides,
  });
}

const api = () => request(app);
const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { api, auth, createUser, createProduct };
