const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// Returns the user's cart (creating an empty one on first use) with products populated.
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function serialize(cart) {
  // Drop items whose product was deleted by an admin.
  const items = cart.items.filter((i) => i.product);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { items, total: Math.round(total * 100) / 100 };
}

// GET /api/cart
async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  res.json(serialize(cart));
}

// POST /api/cart  { productId, quantity }  -> adds to the existing quantity
async function addItem(req, res) {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart = await Cart.findOne({ user: req.user._id }) ||
    new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > product.stock) throw new ApiError(400, `Only ${product.stock} in stock`);

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, quantity });

  await cart.save();
  await cart.populate('items.product');
  res.status(201).json(serialize(cart));
}

// PATCH /api/cart/:productId  { quantity }  -> sets the quantity
async function updateItem(req, res) {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);

  const item = cart.items.find((i) => i.product && i.product._id.toString() === req.params.productId);
  if (!item) throw new ApiError(404, 'Item not in cart');
  if (quantity > item.product.stock) throw new ApiError(400, `Only ${item.product.stock} in stock`);

  item.quantity = quantity;
  await cart.save();
  res.json(serialize(cart));
}

// DELETE /api/cart/:productId
async function removeItem(req, res) {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter(
    (i) => i.product && i.product._id.toString() !== req.params.productId
  );
  await cart.save();
  res.json(serialize(cart));
}

// DELETE /api/cart
async function clearCart(req, res) {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ items: [], total: 0 });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
