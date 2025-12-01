const express = require('express');
const { 
  createIncome, 
  getIncomes, 
  getIncome, 
  updateIncome, 
  deleteIncome, 
  getIncomeStats 
} = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Income CRUD operations
router.post('/', createIncome);
router.get('/', getIncomes);
router.get('/stats', getIncomeStats);
router.get('/:id', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;

