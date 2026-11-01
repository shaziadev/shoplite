const Cart = require('../models/Cart');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const stripe = require('../services/stripe');
const { fulfillOrder } = require('../services/orderService');

/**
 * POST /api/orders/checkout
 * Turns the cart into a pending order, then either:
 *  - creates a Stripe Checkout Session and returns its URL, or
 *  - (no Stripe key) fulfils the order immediately and returns the success URL.
 */
async function checkout(req, res) {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const items = (cart?.items || []).filter((i) => i.product);
  if (items.length === 0) throw new ApiError(400, 'Your cart is empty');

  for (const i of items) {
    if (i.quantity > i.product.stock) {
      throw new ApiError(400, `Not enough stock for ${i.product.name}`);
    }
  }

  const orderItems = items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
  }));
  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    total: Math.round(total * 100) / 100,
  });

  const successUrl = `${config.clientUrl}/orders/${order._id}?success=1`;

  if (!stripe) {
    await fulfillOrder(order._id);
    return res.status(201).json({ orderId: order._id, url: successUrl, simulated: true });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: req.user.email,
    line_items: orderItems.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(i.price * 100), // Stripe wants cents
        product_data: { name: i.name },
      },
    })),
    metadata: { orderId: order._id.toString() },
    success_url: successUrl,
    cancel_url: `${config.clientUrl}/cart?cancelled=1`,
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.status(201).json({ orderId: order._id, url: session.url, simulated: false });
}

/**
 * POST /api/webhooks/stripe
 * Stripe calls this after payment. The body must be the raw Buffer
 * so the signature can be verified (see app.js).
 */
async function stripeWebhook(req, res) {
  if (!stripe) return res.status(400).json({ message: 'Stripe is not configured' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      config.stripeWebhookSecret
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook signature error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) await fulfillOrder(orderId);
  }

  res.json({ received: true });
}

// GET /api/orders/mine
async function myOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

// GET /api/orders/:id  (owner or admin)
async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not your order');

  res.json(order);
}

// GET /api/orders  (admin)
async function allOrders(_req, res) {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
}

// PATCH /api/orders/:id/status  (admin)  { status }
async function updateStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true }
  );
  if (!order) throw new ApiError(404, 'Order not found');
  res.json(order);
}

module.exports = { checkout, stripeWebhook, myOrders, getOrder, allOrders, updateStatus };
