const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // stored in dollars, e.g. 19.99
    category: { type: String, required: true, trim: true, lowercase: true },
    image: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Text index powers the ?search= query on name and description.
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
