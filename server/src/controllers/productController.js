const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name: { name: 1 },
};

/**
 * GET /api/products
 * Query params: search, category, minPrice, maxPrice, sort, page, limit
 */
async function listProducts(req, res) {
  const { search, category, minPrice, maxPrice, sort = 'newest' } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);

  // Build the Mongo filter step by step from whatever params were sent.
  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category.toLowerCase();
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

// GET /api/products/categories
async function listCategories(_req, res) {
  const categories = await Product.distinct('category');
  res.json(categories.sort());
}

// GET /api/products/:id
async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
}

// POST /api/products  (admin)
async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}

// PUT /api/products/:id  (admin)
async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
}

// DELETE /api/products/:id  (admin)
async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(204).end();
}

module.exports = {
  listProducts,
  listCategories,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
