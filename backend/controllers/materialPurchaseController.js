const MaterialPurchase = require('../models/MaterialPurchase');

// Create new material purchase
exports.createMaterialPurchase = async (req, res) => {
  try {
    const materialPurchase = await MaterialPurchase.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(materialPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all material purchases for the user
exports.getMaterialPurchases = async (req, res) => {
  try {
    const { startDate, endDate, supplierName, itemName } = req.query;
    const query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
    
    if (supplierName) {
      query.supplierName = { $regex: supplierName, $options: 'i' };
    }
    
    if (itemName) {
      query.itemName = { $regex: itemName, $options: 'i' };
    }
    
    const purchases = await MaterialPurchase.find(query)
      .sort({ purchaseDate: -1 });
    
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single material purchase
exports.getMaterialPurchase = async (req, res) => {
  try {
    const purchase = await MaterialPurchase.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Material purchase not found' });
    }
    
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update material purchase
exports.updateMaterialPurchase = async (req, res) => {
  try {
    const purchase = await MaterialPurchase.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Material purchase not found' });
    }

    Object.assign(purchase, req.body);
    await purchase.save();
    
    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete material purchase
exports.deleteMaterialPurchase = async (req, res) => {
  try {
    const purchase = await MaterialPurchase.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Material purchase not found' });
    }
    
    res.status(200).json({ message: 'Material purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get material purchase statistics
exports.getMaterialPurchaseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = { user: req.user.id };
    
    if (startDate || endDate) {
      matchQuery.purchaseDate = {};
      if (startDate) matchQuery.purchaseDate.$gte = new Date(startDate);
      if (endDate) matchQuery.purchaseDate.$lte = new Date(endDate);
    }
    
    const stats = await MaterialPurchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$supplierName',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ]);

    const totalPurchases = await MaterialPurchase.countDocuments(matchQuery);
    const totalCost = await MaterialPurchase.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    res.status(200).json({
      supplierBreakdown: stats,
      totalPurchases,
      totalCost: totalCost[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

