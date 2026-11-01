const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');
const { stripeWebhook } = require('./controllers/orderController');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl }));
if (config.nodeEnv === 'development') app.use(morgan('dev'));

// The Stripe webhook needs the *raw* body to verify its signature,
// so it is registered BEFORE express.json() parses bodies.
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', stripe: config.stripeEnabled ? 'live-test-mode' : 'simulated' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
