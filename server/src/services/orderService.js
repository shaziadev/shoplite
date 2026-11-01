const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * Marks an order as paid, reduces stock and empties the user's cart.
 * Called by the Stripe webhook, or directly when checkout is simulated.
 * Safe to call twice: an already-paid order is left untouched.
 */
async function fulfillOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.status !== 'pending') return order;

  // $inc with a stock guard so we never go below zero.
  await Promise.all(
    order.items.map((item) =>
      Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      )
    )
  );

  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();

  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
  return order;
}

module.exports = { fulfillOrder };
