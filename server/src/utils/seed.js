/**
 * Seeds the database with sample products and two accounts:
 *   admin@shoplite.dev / admin123  (admin)
 *   user@shoplite.dev  / user123   (customer)
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const products = [
  { name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 25, description: 'Over-ear Bluetooth headphones with 30-hour battery life and noise isolation.' },
  { name: 'Mechanical Keyboard', price: 64.5, category: 'electronics', stock: 40, description: 'Compact 75% layout with hot-swappable switches and RGB backlight.' },
  { name: 'USB-C Charger 65W', price: 29.99, category: 'electronics', stock: 60, description: 'Fast GaN charger for laptops and phones.' },
  { name: '4K Webcam', price: 89.0, category: 'electronics', stock: 12, description: 'Auto-focus webcam with dual microphones for crisp video calls.' },
  { name: 'Cotton Hoodie', price: 34.99, category: 'clothing', stock: 50, description: 'Soft brushed-cotton hoodie with a relaxed fit.' },
  { name: 'Running Sneakers', price: 59.99, category: 'clothing', stock: 30, description: 'Lightweight sneakers with breathable mesh and cushioned soles.' },
  { name: 'Denim Jacket', price: 69.0, category: 'clothing', stock: 15, description: 'Classic washed denim jacket.' },
  { name: 'Ceramic Coffee Mug', price: 12.5, category: 'home', stock: 100, description: '350 ml matte ceramic mug, dishwasher safe.' },
  { name: 'Desk Lamp', price: 24.99, category: 'home', stock: 35, description: 'LED desk lamp with three brightness levels and USB charging port.' },
  { name: 'Indoor Plant Pot', price: 18.0, category: 'home', stock: 45, description: 'Minimal concrete planter with drainage tray.' },
  { name: 'Clean Code', price: 32.0, category: 'books', stock: 20, description: 'A handbook of agile software craftsmanship.' },
  { name: 'JavaScript: The Good Parts', price: 22.0, category: 'books', stock: 18, description: 'A concise guide to the best features of JavaScript.' },
  { name: 'Yoga Mat', price: 27.99, category: 'sports', stock: 40, description: 'Non-slip 6 mm mat with carrying strap.' },
  { name: 'Water Bottle 1L', price: 15.99, category: 'sports', stock: 80, description: 'Insulated stainless-steel bottle, keeps drinks cold for 24 hours.' },
].map((p, i) => ({ ...p, image: img(`shoplite-${i}`) }));

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected, clearing old data...');

  await Promise.all([User.deleteMany(), Product.deleteMany(), Cart.deleteMany(), Order.deleteMany()]);

  // User.create runs the pre-save hook so passwords get hashed.
  await User.create([
    { name: 'Admin', email: 'admin@shoplite.dev', password: 'admin123', role: 'admin' },
    { name: 'Demo User', email: 'user@shoplite.dev', password: 'user123' },
  ]);
  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products and 2 users.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
