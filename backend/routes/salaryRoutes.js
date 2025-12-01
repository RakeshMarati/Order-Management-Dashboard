const express = require('express');
const { 
  createSalary, 
  getSalaries, 
  getSalary, 
  updateSalary, 
  deleteSalary, 
  getSalaryStats 
} = require('../controllers/salaryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Salary CRUD operations
router.post('/', createSalary);
router.get('/', getSalaries);
router.get('/stats', getSalaryStats);
router.get('/:id', getSalary);
router.put('/:id', updateSalary);
router.delete('/:id', deleteSalary);

module.exports = router;

