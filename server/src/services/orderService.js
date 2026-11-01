const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

/**
 * Marks an order as paid, reduces stock and empties the user's cart.
 * Called by the Stripe webhook, or directly when checkout is simulated.
 *
 * Idempotent: the order is moved from "pending" to "paid" in a single atomic
 * update, so if Stripe retries the webhook (or two calls race), only the first
 * call gets the order back and reduces stock.
 */
async function fulfillOrder(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'pending' },
    { status: 'paid', paidAt: new Date() },
    { returnDocument: 'after' }
  );
  // Already paid (or unknown order): nothing to do.
  if (!order) return Order.findById(orderId);

  // $inc with a stock guard so stock never goes below zero.
  const results = await Promise.all(
    order.items.map((item) =>
      Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      )
    )
  );

  // The cart checks stock before checkout, but stock can change between checkout
  // and payment. Flag any item we could not reserve so an admin can follow up.
  results.forEach((result, i) => {
    if (result.modifiedCount === 0) {
      console.warn(
        `[orders] Order ${order._id}: not enough stock to reserve product ${order.items[i].product}`
      );
    }
  });

  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
  return order;
}

module.exports = { fulfillOrder };
