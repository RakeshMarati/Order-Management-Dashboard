const express = require('express');
const { 
  createPayment, 
  getPayments, 
  getPayment, 
  updatePayment, 
  deletePayment, 
  getPaymentStats 
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Payment CRUD operations
router.post('/', createPayment);
router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/:id', getPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;

