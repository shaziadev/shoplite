const Stripe = require('stripe');
const config = require('../config/env');

// Only create a client when a key is configured; otherwise checkout is simulated.
const stripe = config.stripeEnabled ? new Stripe(config.stripeSecretKey) : null;

if (!stripe && config.nodeEnv !== 'test') {
  console.warn(
    '[stripe] STRIPE_SECRET_KEY not set - checkout will be SIMULATED (orders are marked paid instantly). ' +
      'Add a test key from https://dashboard.stripe.com/test/apikeys to use real Stripe Checkout.'
  );
}

module.exports = stripe;
