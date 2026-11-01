const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

// Connect to MongoDB first, then start accepting requests.
connectDB(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`ShopLite API running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
