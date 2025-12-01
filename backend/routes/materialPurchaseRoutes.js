const express = require('express');
const { 
  createMaterialPurchase, 
  getMaterialPurchases, 
  getMaterialPurchase, 
  updateMaterialPurchase, 
  deleteMaterialPurchase, 
  getMaterialPurchaseStats 
} = require('../controllers/materialPurchaseController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Material Purchase CRUD operations
router.post('/', createMaterialPurchase);
router.get('/', getMaterialPurchases);
router.get('/stats', getMaterialPurchaseStats);
router.get('/:id', getMaterialPurchase);
router.put('/:id', updateMaterialPurchase);
router.delete('/:id', deleteMaterialPurchase);

module.exports = router;

