const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.use(protect); // every cart route needs a logged-in user

router.get('/', ctrl.getCart);
router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Invalid product id'),
    body('quantity').optional().isInt({ min: 1 }).toInt(),
  ],
  validate,
  ctrl.addItem
);
router.patch(
  '/:productId',
  [param('productId').isMongoId(), body('quantity').isInt({ min: 1 }).toInt()],
  validate,
  ctrl.updateItem
);
router.delete('/:productId', param('productId').isMongoId(), validate, ctrl.removeItem);
router.delete('/', ctrl.clearCart);

module.exports = router;
