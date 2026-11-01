const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/productController');

const adminOnly = [protect, requireRole('admin')];
const idParam = param('id').isMongoId().withMessage('Invalid product id');

// Shared rules for create (all required) and update (all optional).
const productRules = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('name').trim().notEmpty().withMessage('Name is required'),
    field('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat(),
    field('category').trim().notEmpty().withMessage('Category is required'),
    field('stock').isInt({ min: 0 }).withMessage('Stock must be a whole number >= 0').toInt(),
    body('description').optional().isString(),
    body('image').optional({ values: 'falsy' }).isURL().withMessage('Image must be a URL'),
  ];
};

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'name']),
  ],
  validate,
  ctrl.listProducts
);
router.get('/categories', ctrl.listCategories);
router.get('/:id', idParam, validate, ctrl.getProduct);

router.post('/', adminOnly, productRules(false), validate, ctrl.createProduct);
router.put('/:id', adminOnly, idParam, productRules(true), validate, ctrl.updateProduct);
router.delete('/:id', adminOnly, idParam, validate, ctrl.deleteProduct);

module.exports = router;
