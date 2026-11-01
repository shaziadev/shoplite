const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.use(protect);

router.post('/checkout', ctrl.checkout);
router.get('/mine', ctrl.myOrders);
router.get('/', requireRole('admin'), ctrl.allOrders);
router.get('/:id', param('id').isMongoId(), validate, ctrl.getOrder);
router.patch(
  '/:id/status',
  requireRole('admin'),
  [param('id').isMongoId(), body('status').isIn(['pending', 'paid', 'shipped', 'cancelled'])],
  validate,
  ctrl.updateStatus
);

module.exports = router;
