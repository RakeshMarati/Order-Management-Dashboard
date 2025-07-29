const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrder, 
  deleteOrder, 
  getOrderStats 
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Order CRUD operations
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
